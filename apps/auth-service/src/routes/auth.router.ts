import express, { Router } from "express";
import {
  createShop,
  createStripeConnectLink,
  getSeller,
  getUser,
  loginSeller,
  loginUser,
  refreshToken,
  registerSeller,
  userForgotPassword,
  userRegistration,
  userResetPassword,
  verifySeller,
  verifyUser,
  verifyUserForgotPassword,
} from "../controllers/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller, isUser } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();
//user routes
router.post("/user-registration", userRegistration);
router.post("/user-verify", verifyUser);
router.post("/user-login", loginUser);
router.post("/refresh-token", refreshToken);
router.get("/user-logged-in", isAuthenticated, isUser, getUser);
router.post("/user-forgot-password", userForgotPassword);
router.post("/user-verify-forgot-password", verifyUserForgotPassword);
router.post("/user-reset-password", userResetPassword);
//sellers routes can be added similarly
router.post("/seller-registration", registerSeller);
router.post("/seller-verify", verifySeller);
router.post("/seller-login", loginSeller);
router.get("/seller-logged-in", isAuthenticated, isSeller, getSeller);
// stripe connect route
router.post("/create-stripe-link", createStripeConnectLink);
//shop routes
router.post("/create-shop", createShop);

export default router;
