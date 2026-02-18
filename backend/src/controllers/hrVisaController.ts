import { Request, Response } from "express";
import OnboardingApplication from "../models/OnboardingApplication";
import Document from "../models/Document";

export const getVisaOverview = async (_req: Request, res: Response) => {
  try {
    const apps = await OnboardingApplication.find()
      .populate("user", "username email workAuthorization profile")
      .lean();

    const out = await Promise.all(
      apps.map(async (a: any) => {
        if (!a.user) return null;

        const user = a.user;

        const docs = await Document.find({
          user: user._id,
          deletedAt: null,
        }).lean();

        let currentStep = "Submitted Onboarding";
        let stepStatus: "pending" | "approved" | "rejected" = "pending";
        let nextAction = "Check HR";

        if (docs.length === 0) {
          currentStep = "No Documents Uploaded";
          nextAction = "Upload Required Documents";
        } else {
          const hasRejected = docs.some((d) => d.status === "rejected");
          const allApproved = docs.every((d) => d.status === "approved");

          if (hasRejected) {
            currentStep = "Document Rejected";
            stepStatus = "rejected";
            nextAction = "Employee Re-upload Required";
          } else if (allApproved) {
            currentStep = "All Documents Approved";
            stepStatus = "approved";
            nextAction = "Completed";
          } else {
            currentStep = "Documents Under Review";
            stepStatus = "pending";
            nextAction = "HR Review Required";
          }
        }

        const startDate = user.workAuthorization?.startDate ?? null;
        const endDate = user.workAuthorization?.endDate ?? null;

        let daysRemaining: number | null = null;

        if (endDate) {
          const end = new Date(endDate);
          const now = new Date();
          end.setHours(0, 0, 0, 0);
          now.setHours(0, 0, 0, 0);

          const diff = end.getTime() - now.getTime();
          daysRemaining = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        }

        return {
          id: a._id,
          employeeName:
            `${user.profile?.firstName ?? ""} ${user.profile?.lastName ?? ""}`.trim() ||
            user.username,
          email: user.email,
          visaType: user.workAuthorization?.authType ?? "Not Set",
          startDate,
          endDate,
          daysRemaining,
          currentStep,
          stepStatus,
          nextAction,
        };
      }),
    );

    const filtered = out.filter(Boolean);

    const inProgress = filtered.filter((r: any) => r.stepStatus !== "approved");

    return res.json({
      ok: true,
      inProgress,
      all: filtered,
    });
  } catch (err) {
    console.error("getVisaOverview error", err);
    return res.status(500).json({ ok: false });
  }
};
