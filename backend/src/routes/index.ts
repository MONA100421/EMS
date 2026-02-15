import { Router } from "express";
import * as authCtrl from "../controllers/authController";
import * as onboardingCtrl from "../controllers/onboardingController";
import * as uploadCtrl from "../controllers/uploadController";
// import * as documentCtrl from "../controllers/documentController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../utils/requireRole";

const router = Router();

// AUTH
router.post("/auth/login", authCtrl.loginHandler);
router.post("/auth/register", authCtrl.registerHandler);
router.post("/auth/refresh", authCtrl.refreshHandler);
router.post("/auth/logout", authCtrl.logoutHandler);

// ONBOARDING (user)
// router.get("/onboarding/me", authMiddleware, onboardingCtrl.getMyOnboarding);
// router.post("/onboarding", authMiddleware, onboardingCtrl.submitOnboarding);

// UPLOADS
router.post("/uploads/presign", authMiddleware, uploadCtrl.presignUpload);
router.post("/uploads/complete", authMiddleware, uploadCtrl.uploadComplete);
router.post("/uploads/presign-get", authMiddleware, uploadCtrl.presignGet);

// DOCUMENTS
//router.get("/documents/my", authMiddleware, documentCtrl.getMyDocuments);
//router.post("/documents", authMiddleware, documentCtrl.uploadDocument);

// HR routes (require role)
//router.get(
//  "/hr/onboarding",
//  authMiddleware,
//  requireRole("hr"),
//  onboardingCtrl.listOnboardingsForHR,
//);

export default router;
