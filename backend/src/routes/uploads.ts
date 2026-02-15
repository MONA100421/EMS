import { Router } from "express";
import * as uploadCtrl from "../controllers/uploadController";
import { authMiddleware } from "../middleware/authMiddleware";
import { getDocumentsByUser } from "../controllers/uploadController";

const router = Router();

router.post("/presign", authMiddleware, uploadCtrl.presignUpload);
router.post("/complete", authMiddleware, uploadCtrl.uploadComplete);
router.post("/presign-get", authMiddleware, uploadCtrl.presignGet);

router.get(
  "/documents/by-user/:id",
  authMiddleware,
  uploadCtrl.getDocumentsByUser,
);


export default router;
