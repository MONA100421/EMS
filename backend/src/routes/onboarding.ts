import { Router } from "express";
import * as onboardingCtrl from "../controllers/onboardingController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Employee only
router.get("/me", authMiddleware, onboardingCtrl.getMyOnboarding);
router.post("/", authMiddleware, onboardingCtrl.submitOnboarding);

export default router;
