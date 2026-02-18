import { Request, Response } from "express";
import mongoose from "mongoose";
import OnboardingApplication from "../models/OnboardingApplication";
import Document from "../models/Document";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  never_submitted: ["pending"],
  pending: [],
  rejected: ["pending"],
  approved: [],
};

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
 * GET /api/onboarding/me
 */
export const getMyOnboarding = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ ok: false, message: "Unauthenticated" });
    }

    let app = await OnboardingApplication.findOne({ user: user.userId });

    if (!app) {
      app = await OnboardingApplication.create({
        user: user.userId,
        status: "never_submitted",
        formData: {},
        history: [
          {
            status: "never_submitted",
            updatedAt: new Date(),
            action: "Started Onboarding",
          },
        ],
      });
    }

    const baseDocs = [
      { type: "profile_photo", category: "onboarding" },
      { type: "id_card", category: "onboarding" },
      { type: "work_auth", category: "onboarding" },
    ];

    for (const doc of baseDocs) {
      await Document.findOneAndUpdate(
        { user: user.userId, type: doc.type },
        {
          $setOnInsert: {
            user: user.userId,
            type: doc.type,
            category: doc.category,
            status: "not_started",
          },
        },
        { upsert: true },
      );
    }

    return res.json({
      ok: true,
      application: {
        id: app._id.toString(),
        status: dbToUIStatus(app.status),
        formData: app.formData || {},
        hrFeedback: app.hrFeedback || null,
        submittedAt: app.submittedAt ?? null,
        reviewedAt: app.reviewedAt ?? null,
        version: app.__v,
      },
    });
  } catch (err) {
    console.error("getMyOnboarding error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

/**
 * POST /api/onboarding
 */
export const submitOnboarding = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = (req as any).user;
    const { formData, version } = req.body;

    const app = await OnboardingApplication.findOne({
      user: user.userId,
      __v: version,
    }).session(session);

    if (!app) {
      await session.abortTransaction();
      return res.status(409).json({
        ok: false,
        message: "Application modified. Please refresh.",
      });
    }

    if (!ALLOWED_TRANSITIONS[app.status]?.includes("pending")) {
      await session.abortTransaction();
      return res.status(400).json({
        ok: false,
        message: `Cannot submit from ${app.status}`,
      });
    }

    app.formData = formData;
    app.status = "pending";
    app.submittedAt = new Date();
    app.history.push({
      status: "pending",
      updatedAt: new Date(),
      action: "Submission",
    });

    await app.save({ session });
    await session.commitTransaction();

    return res.json({
      ok: true,
      status: dbToUIStatus(app.status),
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("submitOnboarding error:", err);
    return res.status(500).json({ ok: false });
  } finally {
    session.endSession();
  }
};
