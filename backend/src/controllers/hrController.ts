import { Request, Response } from "express";
import User from "../models/User";
import OnboardingApplication from "../models/OnboardingApplication";
import RegistrationToken from "../models/RegistrationToken";
import { sendInviteEmail } from "../utils/email";
import crypto from "crypto";
import mongoose from "mongoose";
import EmployeeProfile from "../models/EmployeeProfile";
import NotificationModel from "../models/Notification";
import { NotificationTypes } from "../utils/notificationTypes";

const dbToUIStatus = (s: string | undefined) => {
  switch (s) {
    case "never_submitted":
      return "never-submitted";
    case "pending":
      return "pending";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    default:
      return "never-submitted";
  }
};

/**
 * GET /api/hr/employees
 */
export const listEmployees = async (_req: Request, res: Response) => {
  try {
    const result = await User.aggregate([
      { $match: { role: "employee" } },
      {
        $lookup: {
          from: "onboardingapplications",
          localField: "_id",
          foreignField: "user",
          as: "appData",
        },
      },
      { $unwind: { path: "$appData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: { $ifNull: ["$appData._id", "$_id"] },

          firstName: { $ifNull: ["$appData.formData.firstName", "N/A"] },
          lastName: { $ifNull: ["$appData.formData.lastName", "User"] },
          preferredName: {
            $ifNull: ["$appData.formData.preferredName", ""],
          },

          ssn: { $ifNull: ["$appData.formData.ssn", "N/A"] },
          phone: { $ifNull: ["$appData.formData.phone", "N/A"] },

          email: "$email",

          workAuthTitle: {
            $ifNull: ["$appData.formData.workAuthType", "Not Set"],
          },

          status: { $ifNull: ["$appData.status", "never_submitted"] },
          submittedAt: "$appData.submittedAt",
          version: "$appData.__v",
        },
      },
      {
        $sort: { lastName: 1, firstName: 1 },
      },
    ]);
    return res.json({ ok: true, employees: result });
  } catch (err) {
    console.error("Aggregation error:", err);
    return res.status(500).json({ ok: false });
  }
};

/**
 * POST /api/hr/invite
 */
export const inviteEmployee = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = (req as any).user;
    const { email, name } = req.body;

    if (!email || !name) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        ok: false,
        message: "Both email and name are required to send an invitation",
      });
    }

    await RegistrationToken.updateMany(
      {
        email,
        used: false,
        expiresAt: { $gt: new Date() },
      },
      { $set: { expiresAt: new Date() } },
      { session },
    );

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    await RegistrationToken.create(
      [
        {
          email,
          name,
          tokenHash,
          expiresAt,
          createdBy: user.userId,
          role: "employee",
          used: false,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    // send email
    await sendInviteEmail(email, rawToken, name);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";

    const registrationLink = `${frontendUrl}/register?token=${rawToken}&email=${encodeURIComponent(
      email,
    )}`;

    return res.json({
      ok: true,
      registrationLink,
    });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();

    if (err.code === 11000) {
      return res.status(409).json({
        ok: false,
        message: "Active token already exists. Please retry.",
      });
    }

    console.error("inviteEmployee error:", err);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET /api/hr/invite/history
 */
export const inviteHistory = async (_req: Request, res: Response) => {
  try {
    const tokens = await RegistrationToken.find()
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .lean();

    const now = Date.now();

    const out = await Promise.all(
      tokens.map(async (t: any) => {
        const expiresAtTime =
          t.expiresAt instanceof Date
            ? t.expiresAt.getTime()
            : new Date(t.expiresAt).getTime();

        const status = t.used
          ? "used"
          : now > expiresAtTime
            ? "expired"
            : "active";

        let onboarding = null;
        if (t.usedBy) {
          onboarding = await OnboardingApplication.findOne({
            user: t.usedBy,
          }).lean();
        }

        return {
          id: t._id,
          email: t.email,
          name: t.name || "N/A",
          createdAt: t.createdAt,
          expiresAt: t.expiresAt,
          used: t.used,
          usedAt: t.usedAt,
          status,
          sentBy: t.createdBy?.username || "System",

          registrationLink: t.used
            ? null
            : "Invitation link was sent via email",

          onboardingSubmitted: !!onboarding,
        };
      }),
    );

    return res.json({ ok: true, history: out });
  } catch (err) {
    console.error("inviteHistory error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal server error" });
  }
};

export const searchEmployees = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ ok: true, employees: [] });

    const regex = new RegExp(q as string, "i");
    const users = await User.find({
      role: "employee",
      $or: [{ username: regex }, { email: regex }],
    }).lean();

    return res.json({ ok: true, employees: users });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
};

export const getHRStats = async (_req: Request, res: Response) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const pendingOnboarding = await OnboardingApplication.countDocuments({
      status: "pending",
    });

    return res.json({
      ok: true,
      stats: {
        totalEmployees,
        pendingOnboarding,
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
};

export const listOnboardingApplications = async (
  req: Request,
  res: Response,
) => {
  try {
    const apps = await OnboardingApplication.find()
      .populate("user", "username email")
      .sort({ submittedAt: -1 })
      .lean();

    const pending = apps.filter((a) => a.status === "pending");
    const approved = apps.filter((a) => a.status === "approved");
    const rejected = apps.filter((a) => a.status === "rejected");

    return res.json({
      ok: true,
      grouped: {
        pending,
        approved,
        rejected,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).lean();

    if (!user) {
      return res.status(404).json({ ok: false, message: "Employee not found" });
    }

    return res.json({ ok: true, employee: user });
  } catch (err) {
    console.error("getEmployeeById error:", err);
    return res.status(500).json({ ok: false });
  }
};

// GET /api/hr/onboarding
export const listOnboardingsForHR = async (req: Request, res: Response) => {
  try {
    const apps = await OnboardingApplication.find()
      .populate("user", "username email")
      .sort({ submittedAt: -1 })
      .lean();

    const grouped = {
      pending: [] as any[],
      approved: [] as any[],
      rejected: [] as any[],
    };

    apps.forEach((a: any) => {
      const record = {
        id: a._id,
        employee: a.user
          ? {
              id: a.user._id,
              username: a.user.username || "Unknown",
              email: a.user.email || "N/A",
            }
          : {
              id: "",
              username: "Unknown",
              email: "N/A",
            },
        status: dbToUIStatus(a.status),
        submittedAt: a.submittedAt ?? a.createdAt,
        version: a.__v,
      };
      if (grouped[a.status as keyof typeof grouped]) {
        grouped[a.status as keyof typeof grouped].push(record);
      }
    });

    return res.json({ ok: true, grouped });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

// POST /api/hr/onboarding/:id/review
export const reviewOnboarding = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const hrUser = (req as any).user;
    const { id } = req.params;
    const { decision, feedback } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      await session.abortTransaction();
      return res.status(400).json({ ok: false, message: "Invalid decision" });
    }

    const app = await OnboardingApplication.findById(id).session(session);

    if (!app) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ ok: false, message: "Application not found" });
    }

    if (app.status === "approved") {
      await session.abortTransaction();
      return res.status(400).json({ ok: false, message: "Already approved" });
    }

    if (decision === "approved") {
      const formData = app.formData || {};

      await User.findByIdAndUpdate(
        app.user,
        {
          $set: {
            "profile.firstName": formData.firstName,
            "profile.lastName": formData.lastName,
            "workAuthorization.authType": formData.workAuthType,
            "workAuthorization.startDate": formData.startDate,
            "workAuthorization.endDate": formData.endDate,
          },
        },
        { session }
      );
    }


    app.status = decision;
    app.hrFeedback = feedback || "";
    app.reviewedAt = new Date();
    app.history.push({
      status: decision,
      updatedAt: new Date(),
      action: `HR Review: ${decision}`,
    });

    await app.save({ session });
    await session.commitTransaction();

    setImmediate(async () => {
      try {
        const employee = await User.findById(app.user);

        if (employee) {
          await NotificationModel.create({
            user: employee._id,
            type:
              decision === "approved"
                ? NotificationTypes.ONBOARDING_REVIEW_APPROVED
                : NotificationTypes.ONBOARDING_REVIEW_REJECTED,
            title: `Onboarding ${decision === "approved" ? "Approved" : "Rejected"}`,
            message: feedback || "Your application status has been updated.",
          });

          if (employee.email) {
            console.log("Email would be sent here (queue disabled for MVP)");
          }
        }
      } catch (e) {
        console.error("Notification Side-effect error:", e);
      }
    });

    return res.json({ ok: true, status: dbToUIStatus(app.status) });
  } catch (err) {
    await session.abortTransaction();
    console.error("reviewOnboarding error", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  } finally {
    session.endSession();
  }
};

// GET /api/hr/onboarding/:id
export const getOnboardingDetailForHR = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const app = await OnboardingApplication.findById(id)
      .populate("user", "username email")
      .lean();

    if (!app)
      return res
        .status(404)
        .json({ ok: false, message: "Application not found" });

    return res.json({
      ok: true,
      application: {
        id: app._id,
        status: dbToUIStatus(app.status),
        formData: app.formData || {},
        hrFeedback: app.hrFeedback || null,
        submittedAt: app.submittedAt ?? null,
        reviewedAt: app.reviewedAt ?? null,
        version: app.__v,
        employee: app.user
          ? {
              id: (app.user as any)._id,
              username: (app.user as any).username,
              email: (app.user as any).email,
            }
          : null,
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

