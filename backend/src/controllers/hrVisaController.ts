import { Request, Response } from "express";
import User from "../models/User";
import OnboardingApplication from "../models/OnboardingApplication";
import Document from "../models/Document";

export const getVisaOverview = async (_req: Request, res: Response) => {
  try {
    const apps = await OnboardingApplication.find()
      .populate("user", "username email")
      .lean();

    const out = await Promise.all(
      apps.map(async (a: any) => {
        const workAuth = a.formData?.workAuthType;

        const docs = await Document.find({
          user: a.user._id,
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

        return {
          id: a._id,
          employeeName: a.user?.username || "",
          email: a.user?.email || "",
          visaType: workAuth || "Not Set",
          startDate: a.formData?.visaStart || null,
          endDate: a.formData?.visaEnd || null,
          daysRemaining: a.formData?.visaEnd
            ? Math.max(
                0,
                Math.ceil(
                  (new Date(a.formData.visaEnd).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
                ),
              )
            : null,
          currentStep,
          stepStatus,
          nextAction,
        };
      }),
    );

    const inProgress = out.filter((r) => r.stepStatus !== "approved");
    const all = out;

    return res.json({ ok: true, inProgress, all });
  } catch (err) {
    console.error("getVisaOverview error", err);
    return res.status(500).json({ ok: false });
  }
};

