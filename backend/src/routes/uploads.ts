import { Router } from "express";
import * as uploadCtrl from "../controllers/uploadController";
import { authMiddleware } from "../middleware/authMiddleware";
import { enforceVisaOrder } from "../middleware/enforceVisaOrder";

const router = Router();

router.post("/presign", authMiddleware, uploadCtrl.presignUpload);
router.post(
  "/complete",
  authMiddleware,
  enforceVisaOrder,
  uploadCtrl.uploadComplete,
);
router.post("/presign-get", authMiddleware, uploadCtrl.presignGet);

router.get(
  "/documents/by-user/:id",
  authMiddleware,
  uploadCtrl.getDocumentsByUser,
);

router.get(
  "/documents/:id/download",
  authMiddleware,
  uploadCtrl.downloadDocumentById,
);


export default router;
