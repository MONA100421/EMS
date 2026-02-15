import authRoutes from "./auth";
import onboardingRoutes from "./onboarding";
import uploadRoutes from "./uploads";
import hrRoutes from "./hr";
import { Router } from "express";


const router = Router();

router.use("/auth", authRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/uploads", uploadRoutes);
router.use("/hr", hrRoutes);

export default router;
