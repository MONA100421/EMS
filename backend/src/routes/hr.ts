import { Router } from "express";
import { inviteEmployee, inviteHistory } from "../controllers/hrController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../utils/requireRole";

const router = Router();

router.post("/invite", authMiddleware, requireRole("hr"), inviteEmployee);
router.get("/invite/history", authMiddleware, requireRole("hr"), inviteHistory);

export default router;
