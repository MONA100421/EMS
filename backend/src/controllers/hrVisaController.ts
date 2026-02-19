import { Request, Response } from "express";
import OnboardingApplication from "../models/OnboardingApplication";
import Document from "../models/Document";
import Notification from "../models/Notification";
import User from "../models/User";

export const notifyVisaEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id).populate("user");

    const stepLabels: Record<string, string> = {
      opt_receipt: "OPT Receipt",
      opt_ead: "OPT EAD",
      i_983: "I-983",
      i_20: "I-20",
    };

    if (!document) {
      return res.status(404).json({ ok: false, message: "Document not found" });
    }

    const user: any = document.user;

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    await Notification.create({
      user: user._id,
      type: "VISA_UPLOAD_REQUIRED",
      title: "Visa document upload required",
      message: `Please upload your ${stepLabels[document.type]} document.`,
    });

    console.log("Visa upload notification created for:", user.email);

    return res.json({ ok: true });
  } catch (err) {
    console.error("notifyVisaEmployee error:", err);
    return res.status(500).json({ ok: false });
  }
};


export const getVisaOverview = async (_req: Request, res: Response) => {
  try {
    const apps = await OnboardingApplication.find()
      .populate("user", "username email workAuthorization profile")
      .lean();

    const orderedSteps = ["opt_receipt", "opt_ead", "i_983", "i_20"];

    const stepLabels: Record<string, string> = {
      opt_receipt: "OPT Receipt",
      opt_ead: "OPT EAD",
      i_983: "I-983",
      i_20: "I-20",
    };

    const out = await Promise.all(
      apps.map(async (a: any) => {
        if (!a.user) return null;

        const user = a.user;

        if (!["opt", "opt-stem"].includes(user.workAuthorization?.authType)) {
          return null;
        }

        if (a.status !== "approved") {
          return {
            id: null,
            employeeName:
              `${user.profile?.firstName ?? ""} ${user.profile?.lastName ?? ""}`.trim() ||
              user.username,
            email: user.email,
            visaType: user.workAuthorization?.authType ?? "Not Set",
            startDate: user.workAuthorization?.startDate ?? null,
            endDate: user.workAuthorization?.endDate ?? null,
            daysRemaining: null,
            currentStep: "Onboarding Not Approved",
            stepStatus: "pending",
            nextAction: "Submit or Approve Onboarding Application",
            actionType: "none",
          };
        }

        const docs = await Document.find({
          user: user._id,
          deletedAt: null,
        }).lean();

        let currentStep = "Submitted Onboarding";
        let stepStatus: "pending" | "approved" | "rejected" = "pending";
        let nextAction = "Check HR";
        let actionDocId: string | null = null;
        let actionType: "review" | "notify" | "none" = "none";

        for (const step of orderedSteps) {
          const doc = docs.find((d) => d.type === step);

          if (!doc) {
            currentStep = `Waiting for ${stepLabels[step]}`;
            nextAction = "Employee Upload Required";
            actionType = "notify";
            break;
          }

          if (doc.status === "rejected") {
            currentStep = `${stepLabels[step]} Rejected`;
            stepStatus = "rejected";
            nextAction = "Employee Re-upload Required";
            actionDocId = doc._id.toString();
            break;
          }

          if (doc.status === "pending") {
            currentStep = `${stepLabels[step]} Pending Approval`;
            stepStatus = "pending";
            nextAction = "HR Review Required";
            actionDocId = doc._id.toString();
            actionType = "review";
            break;
          }
        }

        const allApproved = orderedSteps.every((step) =>
          docs.find((d) => d.type === step && d.status === "approved"),
        );

        if (allApproved) {
          currentStep = "All Documents Approved";
          stepStatus = "approved";
          nextAction = "Completed";
          actionType = "none"; 
        }

        let daysRemaining: number | null = null;

        if (user.workAuthorization?.endDate) {
          const end = new Date(user.workAuthorization.endDate);
          const now = new Date();

          end.setHours(0, 0, 0, 0);
          now.setHours(0, 0, 0, 0);

          const diff = end.getTime() - now.getTime();
          daysRemaining = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        }

        return {
          id: actionDocId,
          employeeName:
            `${user.profile?.firstName ?? ""} ${user.profile?.lastName ?? ""}`.trim() ||
            user.username,
          email: user.email,
          visaType: user.workAuthorization?.authType ?? "Not Set",
          startDate: user.workAuthorization?.startDate ?? null,
          endDate: user.workAuthorization?.endDate ?? null,
          daysRemaining,
          currentStep,
          stepStatus,
          nextAction,
          actionType,
          approvedDocuments: docs
            .filter((d) => d.status === "approved")
            .map((d) => ({
              id: d._id,
              type: d.type,
              fileName: d.fileName,
              fileUrl: d.fileUrl,
            })),
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
