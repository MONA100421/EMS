import { Router } from "express";
import {
  inviteEmployee,
  inviteHistory,
  listOnboardingsForHR,
  reviewOnboarding,
  getOnboardingDetailForHR,
  listEmployees,
  getEmployeeById,
} from "../controllers/hrController";

import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../utils/requireRole";
import * as hrVisaController from "../controllers/hrVisaController";

const router = Router();

router.post("/invite", authMiddleware, requireRole("hr"), inviteEmployee);
router.get("/invite/history", authMiddleware, requireRole("hr"), inviteHistory);

router.get("/employees", authMiddleware, requireRole("hr"), listEmployees);
router.get(
  "/employees/:id",
  authMiddleware,
  requireRole("hr"),
  getEmployeeById,
);

// HR onboarding review
router.get(
  "/onboarding",
  authMiddleware,
  requireRole("hr"),
  listOnboardingsForHR,
);
router.get(
  "/onboarding/:id",
  authMiddleware,
  requireRole("hr"),
  getOnboardingDetailForHR,
);
router.post(
  "/onboarding/:id/review",
  authMiddleware,
  requireRole("hr"),
  reviewOnboarding,
);

// Visa
router.get(
  "/visa-overview",
  authMiddleware,
  requireRole("hr"),
  hrVisaController.getVisaOverview,
);

export default router;
