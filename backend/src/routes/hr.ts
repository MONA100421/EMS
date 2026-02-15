import { Router } from "express";
import {
  inviteEmployee,
  inviteHistory,
  listOnboardingApplications,
} from "../controllers/hrController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../utils/requireRole";
import { approveOnboarding } from "../controllers/onboardingController";
import * as hrVisaController from "../controllers/hrVisaController";
import { getEmployeeById } from "../controllers/hrController";

const router = Router();

router.post("/invite", authMiddleware, requireRole("hr"), inviteEmployee);
router.get("/invite/history", authMiddleware, requireRole("hr"), inviteHistory);
router.get("/onboarding", authMiddleware, listOnboardingApplications);


router.post(
  "/onboarding/:id/review",
  authMiddleware,
  requireRole("hr"),
  approveOnboarding,
);

router.get(
  "/visa-overview",
  authMiddleware,
  requireRole("hr"),
  hrVisaController.getVisaOverview,
);

router.get(
  "/employees/:id",
  authMiddleware,
  requireRole("hr"),
  getEmployeeById,
);

export default router;
