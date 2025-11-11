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

//refresh user token
export const refreshUserToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refresh_token;
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

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return next(new AuthError("User not found!!"));
    }

    //generate new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );
    setCookie(res, "access_token", newAccessToken);

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

//get logged in user details
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({ success: true, user });
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
