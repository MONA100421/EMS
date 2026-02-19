import { Request, Response } from "express";
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

    return res.json({
      ok: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username ?? null,
        profile: user.profile ?? {},
        workAuthorization: user.workAuthorization ?? {},
      },
    });
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res.status(500).json({ ok: false });
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false });
    }

    const u = user as any;
    const payload = req.body;

    //  nested object
    if (!u.profile) u.profile = {};
    if (!u.profile.address) u.profile.address = {};
    if (!u.profile.contact) u.profile.contact = {};
    if (!u.profile.emergency) u.profile.emergency = {};
    if (!u.workAuthorization) u.workAuthorization = {};

    // Profile
    if (payload.firstName !== undefined)
      u.profile.firstName = payload.firstName;

    if (payload.lastName !== undefined) u.profile.lastName = payload.lastName;

    if (payload.middleName !== undefined)
      u.profile.middleName = payload.middleName;

    if (payload.preferredName !== undefined)
      u.profile.preferredName = payload.preferredName;

    if (payload.photoUrl !== undefined) u.profile.photoUrl = payload.photoUrl;

    // Address
    if (payload.address) {
      if (payload.address.street !== undefined)
        u.profile.address.street = payload.address.street;

      if (payload.address.apt !== undefined)
        u.profile.address.apt = payload.address.apt;

      if (payload.address.city !== undefined)
        u.profile.address.city = payload.address.city;

      if (payload.address.state !== undefined)
        u.profile.address.state = payload.address.state;

      if (payload.address.zip !== undefined)
        u.profile.address.zip = payload.address.zip;

      if (payload.address.country !== undefined)
        u.profile.address.country = payload.address.country;
    }

    // Contact
    if (payload.phone !== undefined) u.profile.contact.phone = payload.phone;

    if (payload.workPhone !== undefined)
      u.profile.contact.workPhone = payload.workPhone;

    // Emergency
    if (payload.emergency) {
      u.profile.emergency.firstName = payload.emergency.firstName;
      u.profile.emergency.lastName = payload.emergency.lastName;
      u.profile.emergency.middleName = payload.emergency.middleName;
      u.profile.emergency.phone = payload.emergency.phone;
      u.profile.emergency.email = payload.emergency.email;
      u.profile.emergency.relationship = payload.emergency.relationship;
    }

    // Email
    if (payload.email !== undefined) u.email = payload.email;

    // Employment
    if (payload.title !== undefined) {
      u.title = payload.title;
    }

    if (payload.department !== undefined) {
      u.department = payload.department;
    }

    if (payload.manager !== undefined) {
      u.manager = payload.manager;
    }

    if (payload.employeeId !== undefined) {
      u.employeeId = payload.employeeId;
    }

    // Work Authorization
    if (payload.workAuthorization) {
      if (payload.workAuthorization.startDate !== undefined)
        u.workAuthorization.startDate = payload.workAuthorization.startDate;

      if (payload.workAuthorization.authType !== undefined)
        u.workAuthorization.authType = payload.workAuthorization.authType;

      if (payload.workAuthorization.endDate !== undefined)
        u.workAuthorization.endDate = payload.workAuthorization.endDate;

      if (payload.workAuthorization.title !== undefined)
        u.workAuthorization.title = payload.workAuthorization.title;
    }

    await user.save();

    return res.json({
      ok: true,
      user,
    });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    return res.status(500).json({ ok: false });
  }
};


