"use client";

import OtpVerification from "@/components/OtpVerification";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type ApiData = {
  name: string;
  email: string;
  password: string;
};

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    useState<boolean>(false);
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [termsError, setTermsError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showOtp, setShowOtp] = useState(false);
  const [userData, setUserData] = useState<ApiData | null>(null);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
    getValues,
  } = useForm<FormData>({
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const password = watch("password");

  // Client-side validation
  const validateName = (name: string): string | true => {
    if (!name || name.trim() === "") {
      return "Full name is required";
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return "Name must be at least 2 characters";
    }

    if (trimmedName.length > 50) {
      return "Name is too long (max 50 characters)";
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(trimmedName)) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }

    // Check for at least one letter
    if (!/[a-zA-Z]/.test(trimmedName)) {
      return "Name must contain at least one letter";
    }

    return true;
  };

  const validateEmail = (email: string): string | true => {
    if (!email || email.trim() === "") {
      return "Email is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    if (email.length > 254) {
      return "Email is too long";
    }

    const domain = email.split("@")[1]?.toLowerCase();
    const typos: Record<string, string> = {
      "gmial.com": "gmail.com",
      "gmai.com": "gmail.com",
      "yahooo.com": "yahoo.com",
      "hotmial.com": "hotmail.com",
    };

    if (domain && typos[domain]) {
      return `Did you mean ${email.split("@")[0]}@${typos[domain]}?`;
    }

    return true;
  };

  const validatePassword = (password: string): string | true => {
    if (!password || password.trim() === "") {
      return "Password is required";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (password.length > 128) {
      return "Password is too long (max 128 characters)";
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "Password must contain at least one special character";
    }

    // Check for common weak passwords
    const weakPasswords = [
      "password123",
      "12345678",
      "qwerty123",
      "abc12345",
      "password1",
    ];
    if (weakPasswords.includes(password.toLowerCase())) {
      return "This password is too common. Please choose a stronger password";
    }

    return true;
  };

  const validateConfirmPassword = (confirmPassword: string): string | true => {
    if (!confirmPassword || confirmPassword.trim() === "") {
      return "Please confirm your password";
    }

    const passwordValue = getValues("password");
    if (confirmPassword !== passwordValue) {
      return "Passwords do not match";
    }

    return true;
  };

  // Handle Google Sign-Up
  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
    } catch (error: any) {
    } finally {
      setIsLoading(false);
    }
  };

  //handle sign up mutation
  const signupMutation = useMutation({
    mutationFn: async (data: ApiData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`,
        data
      );

      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
    },
  });

  //otp verify mutation
  const otpVerifyMutation = useMutation({
    mutationFn: async (otp: string) => {
      if (!userData) return;
      console.log({ ...userData, otp });
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-verify`,
        { ...userData, otp: otp }
      );

      return response.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    // Validate terms acceptance
    if (!acceptTerms) {
      setTermsError("You must accept the terms and conditions to continue");
      return;
    }
    try {
      setIsLoading(true);
      setTermsError("");

      // Sanitize data
      const sanitizedData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      };
      signupMutation.mutate(sanitizedData);
    } catch (error: any) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string): number => {
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

    return Math.min(strength, 4);
  };

  const passwordStrength = getPasswordStrength(password || "");
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];

  // Handle OTP verification
  const handleOtpVerify = async (otp: string) => {
    otpVerifyMutation.mutate(otp);
  };
  // Handle OTP resend
  const handleOtpResend = async () => {};
  // Handle back to signup
  const handleBackToSignup = () => {
    setShowOtp(false);
    setUserData(null);
  };

  return (
    <>
      {!showOtp ? (
        <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
          <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
            Sign Up
          </h1>
          <p className="text-center text-lg font-medium py-3 text-[#00000099]">
            Home . Sign Up
          </p>

          <div className="w-full flex justify-center">
            <div className="md:w-[480px] w-full p-8 bg-white shadow rounded-lg">
              <h3 className="text-3xl font-semibold text-center mb-6">
                Create Your Account
              </h3>

              <div className="space-y-4">
                {/* Full Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      {...register("name", {
                        validate: validateName,
                        onChange: () => {
                          clearErrors("name");
                        },
                      })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.name
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register("email", {
                        validate: validateEmail,
                        onChange: () => {
                          clearErrors("email");
                        },
                      })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.email
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="Enter your email"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <input
                      id="password"
                      type={passwordVisible ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("password", {
                        validate: validatePassword,
                        onChange: () => {
                          clearErrors("password");
                        },
                      })}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.password
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="Create a password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {passwordVisible ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              level <= passwordStrength
                                ? strengthColors[passwordStrength]
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      {passwordStrength > 0 && (
                        <p className="text-xs text-gray-600">
                          Password strength: {strengthLabels[passwordStrength]}
                        </p>
                      )}
                    </div>
                  )}

                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <input
                      id="confirmPassword"
                      type={confirmPasswordVisible ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("confirmPassword", {
                        validate: validateConfirmPassword,
                        onChange: () => {
                          clearErrors("confirmPassword");
                        },
                      })}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.confirmPassword
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      placeholder="Confirm your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmPasswordVisible(!confirmPasswordVisible)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {confirmPasswordVisible ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => {
                        setAcceptTerms(e.target.checked);
                        setTermsError("");
                      }}
                      className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-200"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the{" "}
                      <Link
                        className="text-blue-600 hover:text-blue-700 font-medium"
                        href={"/terms"}
                      >
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        className="text-blue-600 hover:text-blue-700 font-medium"
                        href={"/privacy"}
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {termsError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {termsError}
                    </p>
                  )}
                </div>

                {/* Create Account Button */}
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isLoading || signupMutation.isPending}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Or sign up with
                  </span>
                </div>
              </div>

              {/* Google Sign-Up */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-gray-700">
                  Sign up with Google
                </span>
              </button>

              {/* Login Link */}
              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                  href={"/login"}
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <OtpVerification
          email={userData?.email || ""}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
          onBack={handleBackToSignup}
          timer={timer}
          setTimer={setTimer}
          canResend={canResend}
          setCanResend={setCanResend}
          length={4}
        />
      )}
    </>
  );
};

export default Signup;
