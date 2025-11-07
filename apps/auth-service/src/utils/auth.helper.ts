import { NextFunction } from "express";
import { ValidationError } from "@packages/error-handler";
import crypto from "crypto";
import redis from "@packages/libs/redis";
import { sendEmail } from "./sendMail";

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
