import { Request, Response } from "express";
import EmployeeProfile from "../models/EmployeeProfile";
import User from "../models/User";
import OnboardingApplication from "../models/OnboardingApplication";
import mongoose from "mongoose";

/* GET /api/employee/me */
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId)
      return res.status(401).json({ ok: false, message: "Unauthorized" });

    const user = await User.findById(userId).lean();
    if (!user)
      return res.status(404).json({ ok: false, message: "User not found" });

    let profile = await EmployeeProfile.findOne({ user: userId }).lean();
    if (!profile) {
      // create a blank profile
      profile = await EmployeeProfile.create({
        user: new mongoose.Types.ObjectId(userId),
      });
    }

    // return both user basic info and profile
    return res.json({
      ok: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: (user as any).username ?? null,
      },
      employee: profile,
    });
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

/* PATCH /api/employee/me
   Body: free-form partial of allowed fields; we selectively map fields.
*/
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ ok: false });
    }

    const payload = req.body;

    const profile = await EmployeeProfile.findOne({ user: userId });
    const user = await User.findById(userId);

    if (!profile || !user) {
      return res.status(404).json({ ok: false });
    }

    /* ---------- User fields ---------- */
    if (payload.firstName || payload.lastName || payload.preferredName) {
      user.profile = {
        ...(user.profile ?? {}),
        firstName: payload.firstName ?? user.profile?.firstName,
        lastName: payload.lastName ?? user.profile?.lastName,
        preferredName: payload.preferredName ?? user.profile?.preferredName,
      };
      await user.save();
    }

    if (payload.email) {
      user.email = payload.email;
      await user.save();
    }

    /* ---------- Profile fields ---------- */
    if (payload.middleName) profile.middleName = payload.middleName;
    if (payload.address) profile.address = payload.address;
    if (payload.phone) profile.phone = payload.phone;
    if (payload.workPhone) profile.workPhone = payload.workPhone;
    if (payload.emergency) profile.emergency = payload.emergency;
    if (payload.employment) profile.employment = payload.employment;

    if (payload.documents && Array.isArray(payload.documents)) {
      profile.documents = payload.documents;
    }

    await profile.save();

    return res.json({ ok: true, employee: profile });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    return res.status(500).json({ ok: false });
  }
};

