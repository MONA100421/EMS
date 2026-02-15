import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile
} from "../controllers/employeeController";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  submitOnboarding,
  getMyOnboarding,
} from "../controllers/onboardingController";

const router = Router();

router.use(authMiddleware); 

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);

router.post("/onboarding", submitOnboarding);
router.get("/onboarding", getMyOnboarding);

export default router;
