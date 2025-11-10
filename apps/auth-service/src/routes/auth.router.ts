import express, { Router } from "express";
import {
  createShop,
  getUser,
  loginUser,
  refreshUserToken,
  registerSeller,
  userForgotPassword,
  userRegistration,
  userResetPassword,
  verifySeller,
  verifyUser,
  verifyUserForgotPassword,
} from "../controllers/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";

const router: Router = express.Router();
//user routes
router.post("/user-registration", userRegistration);
router.post("/user-verify", verifyUser);
router.post("/user-login", loginUser);
router.post("/user-refresh-token", refreshUserToken);
router.get("/user-logged-in", isAuthenticated, getUser);
router.post("/user-forgot-password", userForgotPassword);
router.post("/user-verify-forgot-password", verifyUserForgotPassword);
router.post("/user-reset-password", userResetPassword);
//sellers routes can be added similarly
router.post("/seller-registration", registerSeller);
router.post("/seller-verify", verifySeller);
//shop routes
router.post("/create-shop", createShop);

export default router;
