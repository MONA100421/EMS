import { Router } from "express";
import * as authCtrl from "../controllers/authController";

const router = Router();

router.post("/login", authCtrl.loginHandler);
router.post("/register", authCtrl.registerHandler);
router.post("/refresh", authCtrl.refreshHandler);
router.post("/logout", authCtrl.logoutHandler);
router.get("/validate/:token", authCtrl.validateRegistrationToken);

export default router;
