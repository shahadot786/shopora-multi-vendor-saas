import { Request, Response, NextFunction } from "express";
import { ValidationError } from "@packages/error-handler";
import crypto from "crypto";
import redis from "@packages/libs/redis";
import { sendEmail } from "./sendMail";
import prisma from "@packages/libs/prisma";

// auth registration validation helper
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;
  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError("Missing required fields!");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format!");
  }
};

//otp registration validation helper
export const checkOtpRegistrations = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        "Account locked due to multiple failed attempts! Try again after 10 minutes"
      )
    );
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        "Too many OTP requests! Please wait an hour before requesting again."
      )
    );
  }
  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError("Please wait 1 minute before requesting a new OPT!")
    );
  }
};

//track the otp request
export const trackOtpRequest = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  const otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

  if (otpRequests > 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600);
    return next(
      new ValidationError(
        "Too many OTP request. Please wait an hour before requesting again."
      )
    );
  }

  await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600);
};

//sent otp helper
export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  //generate the opt by using crypto
  const otp = crypto.randomInt(1000, 9999).toString();
  //first send the email
  await sendEmail(email, "Verify your email", template, { name, otp });
  //after send email send the opt to redis server
  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

//verify the otp
export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storeOtp = await redis.get(`otp:${email}`);
  if (!storeOtp) {
    throw new ValidationError("Invalid or expired OTP!!");
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

  if (storeOtp !== otp) {
    if (failedAttempts > 2) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 600); //lock for 10 minutes
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new ValidationError(
        "Too many failed attempts. Your account is locked for 10 minutes!!"
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);
    throw new ValidationError(
      `Incorrect OTP. ${2 - failedAttempts} attempts left.`
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};

//handle forgot password
export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "user" | "seller",
  email: string
) => {
  try {
    if (!email) {
      return next(new ValidationError("Email is required!!"));
    }
    //find the user/seller in DB
    const user =
      userType === "user"
        ? await prisma.users.findUnique({ where: { email } })
        : await prisma.sellers.findUnique({ where: { email } });

    if (!user) throw new ValidationError(`${userType} not found!!`);

    //check otp restrictions
    await checkOtpRegistrations(email, next);
    await trackOtpRequest(email, next);

    //generate OTP and send email
    await sendOtp(
      user.name,
      email,
      userType === "user"
        ? "forgot-password-user-email"
        : "forgot-password-seller-email"
    );

    res.status(200).json({
      message: `OTP sent to your registered email (${user.email}). Please verify your account.`,
    });
  } catch (error) {
    return next(error);
  }
};

//verify user forgot password otp
export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
  email: string,
  otp: string
) => {
  try {
    if (!email || !otp) {
      return next(new ValidationError("Email and OTP are required!!"));
    }

    await verifyOtp(email, otp, next);

    res.status(200).json({
      message: "OTP Verified. You can now reset your password!!",
    });
  } catch (error) {
    return next(error);
  }
};
