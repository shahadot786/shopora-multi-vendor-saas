import express, { Router } from "express";
import {
  getUser,
  loginUser,
  refreshUserToken,
  userForgotPassword,
  userRegistration,
  userResetPassword,
  verifyUser,
  verifyUserForgotPassword,
} from "../controllers/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/user-verify", verifyUser);
router.post("/user-login", loginUser);
router.post("/user-refresh-token", refreshUserToken);
router.get("/user-logged-in", isAuthenticated, getUser);
router.post("/user-forgot-password", userForgotPassword);
router.post("/user-verify-forgot-password", verifyUserForgotPassword);
router.post("/user-reset-password", userResetPassword);

export default router;
