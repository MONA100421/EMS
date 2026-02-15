import { Router } from "express";
import * as onboardingCtrl from "../controllers/onboardingController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../utils/requireRole";

const router = Router();

router.get("/me", authMiddleware, onboardingCtrl.getMyOnboarding);
router.post("/", authMiddleware, onboardingCtrl.submitOnboarding);

// HR review
router.get(
  "/hr",
  authMiddleware,
  requireRole("hr"),
  onboardingCtrl.listOnboardingsForHR,
);

router.post(
  "/hr/:id/review",
  authMiddleware,
  requireRole("hr"),
  onboardingCtrl.reviewOnboarding,
);

export default router;
