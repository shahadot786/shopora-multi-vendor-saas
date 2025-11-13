import { NextFunction, Request, Response } from "express";
import {
  checkOtpRegistrations,
  handleForgotPassword,
  sendOtp,
  trackOtpRequest,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover",
});

// register a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await checkOtpRegistrations(email, next);
    await trackOtpRequest(email, next);
    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({
      message: `OTP sent to your email(${email}). Please verify your account.`,
    });
  } catch (error) {
    return next(error);
  }
};

//verify users
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return next(new ValidationError("All fields are required!!"));
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(
        new ValidationError("User already exists with this email account!!")
      );
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

//login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and Password are required!!"));
    }
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new AuthError("User doesn't exists!"));
    }
    //verify password
    const isMatchPassword = await bcrypt.compare(password, user.password!);
    if (!isMatchPassword) {
      return next(new AuthError("Password is not correct!!"));
    }

    res.clearCookie("seller-access-token");
    res.clearCookie("seller-refresh-token");

    //generate access and refresh token
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    // store the refresh and access token in an httpOnly secure cookie
    setCookie(res, "access_token", accessToken);
    setCookie(res, "refresh_token", refreshToken);

    res.status(200).json({
      message: "Login Successful!",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
};

//refresh token
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies["refresh_token"] ||
      req.cookies["seller-refresh-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
      return new ValidationError("Unauthorized! No refresh token provided.");
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return new JsonWebTokenError("Forbidden! Invalid refresh token.");
    }

    let account;
    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }

    if (!account)
      return res
        .status(401)
        .json({ message: "Unauthorized! Account not found." });

    //generate new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    if (decoded.role === "user") {
      setCookie(res, "access_token", newAccessToken);
    } else if (decoded.role === "seller") {
      setCookie(res, "seller-access-token", newAccessToken);
    }

    req.role = decoded.role;

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

//get logged in user details
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { password, ...rest } = user; //exclude password
    res.status(201).json({ success: true, user: rest });
  } catch (error) {
    return next(error);
  }
};

//forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  await handleForgotPassword(req, res, next, "user", email);
};

//verify forget password otp
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, otp } = req.body;
  await verifyForgotPasswordOtp(req, res, next, email, otp);
};

//reset password
export const userResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return next(new ValidationError("Email and new password are required!!"));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return next(new ValidationError("User not found!!"));

    //compare new password with the existing password
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword) {
      return next(
        new ValidationError(
          "New password cannot be the same as the old password!!"
        )
      );
    }

    //hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: "Password reset successfully!!" });
  } catch (error) {
    return next(error);
  }
};

// register a new seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      return next(
        new ValidationError("Seller already exists with this email!")
      );
    }

    await checkOtpRegistrations(email, next);
    await trackOtpRequest(email, next);
    await sendOtp(name, email, "seller-activation-mail");

    res.status(200).json({
      message: `OTP sent to your email(${email}). Please verify your account.`,
    });
  } catch (error) {
    return next(error);
  }
};

// verify sellers with otp
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, otp, phone_number, country } = req.body;
    if (!name || !email || !password || !otp || !phone_number || !country) {
      return next(new ValidationError("All fields are required!!"));
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return next(
        new ValidationError("Seller already exists with this email account!!")
      );
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: { name, email, password: hashedPassword, phone_number, country },
    });

    res.status(201).json({
      success: true,
      seller,
      message: "Seller registered successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

//login seller
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and Password are required!!"));
    }
    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) {
      return next(new AuthError("Seller doesn't exists!"));
    }
    //verify password
    const isMatchPassword = await bcrypt.compare(password, seller.password!);
    if (!isMatchPassword) {
      return next(new AuthError("Password is not correct!!"));
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    //generate access and refresh token
    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    // store the refresh and access token in an httpOnly secure cookie
    setCookie(res, "seller-access-token", accessToken);
    setCookie(res, "seller-refresh-token", refreshToken);

    res.status(200).json({
      message: "Login Successful!",
      seller: { id: seller.id, name: seller.name, email: seller.email },
    });
  } catch (error) {
    return next(error);
  }
};

// create the shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      address,
      opening_hours,
      website,
      category,
      sellerId,
      taxId,
      businessType,
      zipCode,
      city,
      state,
      country,
    } = req.body;

    if (
      !name ||
      !description ||
      !address ||
      !opening_hours ||
      !category ||
      !sellerId ||
      !zipCode ||
      !city ||
      !state ||
      !country
    ) {
      return next(new ValidationError("All fields are required!!"));
    }

    const existingShop = await prisma.shops.findUnique({
      where: { sellerId },
    });

    if (existingShop) {
      return next(new ValidationError("Shop already exists for this seller!!"));
    }

    const shopData: any = {
      name,
      description,
      address,
      opening_hours,
      category,
      sellerId,
      taxId,
      businessType,
      zipCode,
      city,
      state,
      country,
    };
    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      shop,
      message: "Shop created successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

//create stripe connect account link
export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return next(new ValidationError("Seller ID is required!!"));
    }

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });
    if (!seller) {
      return next(new ValidationError("Seller not found!!"));
    }

    //create stripe account link
    const account = await stripe.accounts.create({
      type: "express",
      country: "GB",
      email: seller?.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    //update the database
    await prisma.sellers.update({
      where: { id: sellerId },
      data: { stripeId: account.id },
    });

    //create the account link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "http://localhost:3000/success",
      return_url: "http://localhost:3000/success",
      type: "account_onboarding",
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (error) {
    return next(error);
  }
};

//get logged in seller details
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    const { password, ...rest } = seller; //exclude password
    res.status(201).json({ success: true, seller: rest });
  } catch (error) {
    return next(error);
  }
};
