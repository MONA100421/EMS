import { Router } from "express";
import {
  inviteEmployee,
  inviteHistory,
  listOnboardingApplications,
} from "../controllers/hrController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../utils/requireRole";
import { approveOnboarding } from "../controllers/onboardingController";


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

export default router;
