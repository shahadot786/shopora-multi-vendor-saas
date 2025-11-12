"use client";

import { OtpVerification } from "@shopora/ui";
import React, { useState } from "react";
import { set, useForm } from "react-hook-form";
import {
  validateName,
  validateEmail,
  validatePassword,
  getPasswordStrength,
  validatePhone,
} from "@shopora/utils";
import {
  BUSINESS_TYPES,
  COUNTRIES,
  OPENING_HOURS_OPTIONS,
  SHOP_CATEGORIES,
} from "@shopora/constants";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface AccountFormData {
  name: string;
  email: string;
  phone_number: string;
  country?: string;
  password: string;
  confirmPassword?: string;
}

interface ShopFormData {
  name: string;
  description: string;
  address: string;
  opening_hours: string;
  custom_opening_hours?: string;
  website?: string;
  category: string;
  taxId?: string;
  businessType: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;
}

export default function SellerSignup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sellerData, setSellerData] = useState<AccountFormData | null>(null);
  const [shopData, setShopData] = useState<ShopFormData | null>(null);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [sellerId, setSellerId] = useState<string | null>(null);

  const accountForm = useForm<AccountFormData>({ mode: "onBlur" });
  const shopForm = useForm<ShopFormData>({ mode: "onBlur" });
  const router = useRouter();

  const steps = [
    { number: 1, name: "Account" },
    { number: 2, name: "Shop Details" },
    { number: 3, name: "Payment" },
  ];

  const password = accountForm.watch("password");
  const passwordStrength = getPasswordStrength(password || "");
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];
  //handle sign up mutation
  const signupMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-registration`,
        data
      );

      return response.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setCurrentStep(1.5); // OTP verification
      setOtpTimer(60);
      setCanResend(false);
      setIsLoading(false);
    },
    onError: (error: AxiosError<any>) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to send OTP. Please try again.";
      setErrorMessage(message);
      setIsLoading(false);
    },
  });
  //otp verify mutation
  const otpVerifyMutation = useMutation({
    mutationFn: async (otp: string) => {
      if (!sellerData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-verify`,
        { ...sellerData, otp: otp }
      );

      return response.data;
    },
    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setCurrentStep(2);
      setIsLoading(false);
    },
    onError: (error: AxiosError<any>) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid OTP. Please try again.";
      setErrorMessage(message);
    },
  });

  //create shop mutation
  const createShopMutation = useMutation({
    mutationFn: async (data: ShopFormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`,
        data
      );

      return response.data;
    },
    onSuccess: () => {
      setIsLoading(false);
    },
    onError: (error: AxiosError<any>) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create shop. Please try again.";
      setErrorMessage(message);
      setIsLoading(false);
    },
  });
  // Step 1: Account Creation Submit
  const handleAccountSubmit = async (data: AccountFormData) => {
    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    const { confirmPassword, ...rest } = data; //exclude confirmPassword
    try {
      signupMutation.mutate(rest);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
      setIsLoading(false);
    }
  };

  // OTP Verification
  const handleOtpVerify = async (otp: string) => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      otpVerifyMutation.mutate(otp);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
      setIsLoading(false);
    }
  };

  // Handle OTP resend
  const handleOtpResend = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-registration`,
        { ...sellerData }
      );

      setOtpTimer(60);
      setCanResend(false);
      setIsLoading(false);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to resend OTP. Please try again.";
      setErrorMessage(message);
    }
  };

  const handleBackToSignup = () => {
    setCurrentStep(1);
  };
  // Step 2: Shop Details Submit
  const handleShopSubmit = async (data: any) => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      if (sellerId) {
        data.sellerId = sellerId;
      }
      const { custom_opening_hours, ...rest } = data;
      setShopData(rest);
      setCurrentStep(3);
      setIsLoading(false);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to save shop details."
      );
      setIsLoading(false);
    }
  };

  // Step 3: Stripe Connection
  const handleStripeConnect = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-stripe-link`,
        { sellerId }
      );
      setIsLoading(false);
      if (response.data.url) {
        createShopMutation.mutate(shopData as ShopFormData);
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to connect payment account."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all shadow-md ${
                      currentStep >= step.number
                        ? "bg-blue-600 text-white scale-110"
                        : "bg-white text-gray-400 border-2 border-gray-300"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <svg
                        className="w-7 h-7"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`mt-3 text-sm font-semibold ${
                      currentStep >= step.number
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-2 mx-4 rounded-full transition-all ${
                      currentStep > step.number ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    style={{ maxWidth: "150px" }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 shadow-sm">
            <svg
              className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          {/* STEP 1: Account Creation */}
          {currentStep === 1 && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
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
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Create Seller Account
                </h2>
                <p className="text-gray-600 mt-2">
                  Start your journey as a seller with us
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      {...accountForm.register("name", {
                        validate: validateName,
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="John Doe"
                      disabled={isLoading}
                    />
                    {accountForm.formState.errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
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
                        {typeof accountForm.formState.errors.name.message ===
                        "string"
                          ? accountForm.formState.errors.name.message
                          : ""}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...accountForm.register("email", {
                        validate: validateEmail,
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="john@example.com"
                      disabled={isLoading}
                    />
                    {accountForm.formState.errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
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
                        {typeof accountForm.formState.errors.email.message ===
                        "string"
                          ? accountForm.formState.errors.email.message
                          : ""}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...accountForm.register("phone_number", {
                        validate: validatePhone,
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="+1234567890"
                      disabled={isLoading}
                    />
                    {accountForm.formState.errors.phone_number && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
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
                        {typeof accountForm.formState.errors.phone_number
                          .message === "string"
                          ? accountForm.formState.errors.phone_number.message
                          : ""}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      {...accountForm.register("country", {
                        required: "Country is required",
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      disabled={isLoading}
                    >
                      <option value="">Select Country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country.name} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {accountForm.formState.errors.country && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
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
                        {typeof accountForm.formState.errors.country.message ===
                        "string"
                          ? accountForm.formState.errors.country.message
                          : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...accountForm.register("password", {
                        validate: validatePassword,
                      })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Create strong password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
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
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l3.59 3.59"
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

                  {/* Password Strength */}
                  {password && password.length > 0 && (
                    <div className="mt-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition-all ${
                              level <= passwordStrength
                                ? strengthColors[passwordStrength]
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      {passwordStrength > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          Password strength:{" "}
                          <span className="font-semibold">
                            {strengthLabels[passwordStrength]}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {accountForm.formState.errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
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
                      {typeof accountForm.formState.errors.password.message ===
                      "string"
                        ? accountForm.formState.errors.password.message
                        : ""}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...accountForm.register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Confirm your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
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
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7m5.858.908a3 3 0 114.243 4.243M3 3l3.59 3.59"
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
                  {accountForm.formState.errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
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
                      {typeof accountForm.formState.errors.confirmPassword
                        .message === "string"
                        ? accountForm.formState.errors.confirmPassword.message
                        : ""}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={accountForm.handleSubmit(handleAccountSubmit)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Continue
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
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 1.5: OTP Verification */}
          {currentStep === 1.5 && (
            <OtpVerification
              email={sellerData?.email || ""}
              onVerify={handleOtpVerify}
              onResend={handleOtpResend}
              onBack={handleBackToSignup}
              timer={otpTimer}
              setTimer={setOtpTimer}
              canResend={canResend}
              setCanResend={setCanResend}
              length={4}
              error={errorMessage}
              setError={setErrorMessage}
            />
          )}

          {/* STEP 2: Shop Details */}
          {currentStep === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Setup Your Shop
                </h2>
                <p className="text-gray-600 mt-2">
                  Tell us about your business
                </p>
              </div>

              <div className="space-y-6">
                {/* Shop Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    {...shopForm.register("name", {
                      required: "Shop name is required",
                      minLength: {
                        value: 5,
                        message: "Shop name must be at least 5 characters",
                      },
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="My Awesome Shop"
                    disabled={isLoading}
                  />
                  {shopForm.formState.errors.name && (
                    <p className="mt-2 text-sm text-red-600">
                      {shopForm.formState.errors.name.message?.toString()}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...shopForm.register("description", {
                      required: "Description is required",
                      minLength: {
                        value: 20,
                        message: "Description must be at least 20 characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "Description cannot exceed 100 characters",
                      },
                    })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition resize-none"
                    placeholder="Describe your shop and products..."
                    disabled={isLoading}
                  />
                  {shopForm.formState.errors.description && (
                    <p className="mt-2 text-sm text-red-600">
                      {shopForm.formState.errors.description.message?.toString()}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    {...shopForm.register("address", {
                      required: "Address is required",
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="123 Main Street"
                    disabled={isLoading}
                  />
                  {shopForm.formState.errors.address && (
                    <p className="mt-2 text-sm text-red-600">
                      {shopForm.formState.errors.address.message?.toString()}
                    </p>
                  )}
                </div>

                {/* Opening Hours */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Opening Hours
                  </label>
                  <select
                    {...shopForm.register("opening_hours", {
                      required: "Opening hours is required",
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                    disabled={isLoading}
                  >
                    <option value="">Select Opening Hours</option>
                    {OPENING_HOURS_OPTIONS.map(({ key, label }) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {shopForm.formState.errors.opening_hours && (
                    <p className="mt-2 text-sm text-red-600">
                      {shopForm.formState.errors.opening_hours.message?.toString()}
                    </p>
                  )}
                </div>
                {shopForm.watch("opening_hours") === "custom" && (
                  <div>
                    <input
                      type="text"
                      {...shopForm.register("custom_opening_hours", {
                        required: "Please specify your opening hours",
                      })}
                      placeholder="e.g., Mon - Fri, 8 AM - 4 PM"
                      className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                    />
                    {shopForm.formState.errors.custom_opening_hours && (
                      <p className="mt-2 text-sm text-red-600">
                        {shopForm.formState.errors.custom_opening_hours.message?.toString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    {...shopForm.register("website", {
                      pattern: {
                        value:
                          /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/,
                        message: "Please enter a valid URL",
                      },
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="https://myshop.com"
                    disabled={isLoading}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    {...shopForm.register("category", {
                      required: "Category is required",
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                    disabled={isLoading}
                  >
                    <option value="">Select Category</option>
                    {SHOP_CATEGORIES.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {shopForm.formState.errors.category && (
                    <p className="mt-2 text-sm text-red-600">
                      {shopForm.formState.errors.category.message?.toString()}
                    </p>
                  )}
                </div>

                {/* Tax ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tax ID / Business Registration Number
                  </label>
                  <input
                    type="text"
                    {...shopForm.register("taxId")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Optional"
                    disabled={isLoading}
                  />
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    {...shopForm.register("businessType", {
                      required: "Business type is required",
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                    disabled={isLoading}
                  >
                    <option value="">Select Business Type</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {shopForm.formState.errors.businessType && (
                    <p className="mt-2 text-sm text-red-600">
                      {shopForm.formState.errors.businessType.message?.toString()}
                    </p>
                  )}
                </div>

                {/* Location Fields */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      {...shopForm.register("city", {
                        required: "City is required",
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="New York"
                      disabled={isLoading}
                    />
                    {shopForm.formState.errors.city && (
                      <p className="mt-2 text-sm text-red-600">
                        {shopForm.formState.errors.city.message?.toString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      {...shopForm.register("state", {
                        required: "State is required",
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="California"
                      disabled={isLoading}
                    />
                    {shopForm.formState.errors.state && (
                      <p className="mt-2 text-sm text-red-600">
                        {shopForm.formState.errors.state.message?.toString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      {...shopForm.register("zipCode", {
                        required: "Zip code is required",
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="10001"
                      disabled={isLoading}
                    />
                    {shopForm.formState.errors.zipCode && (
                      <p className="mt-2 text-sm text-red-600">
                        {shopForm.formState.errors.zipCode.message?.toString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    {...shopForm.register("country", {
                      required: "Country is required",
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                    disabled={isLoading}
                  >
                    <option value="">Select Country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {shopForm.formState.errors.country && (
                    <p className="mt-2 text-sm text-red-600">
                      {shopForm.formState.errors.country.message?.toString()}
                    </p>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={shopForm.handleSubmit(handleShopSubmit)}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue
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
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Setup */}
          {currentStep === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Connect Payment Account
                </h2>
                <p className="text-gray-600 mt-2">
                  Setup Stripe to receive payments
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Why connect Stripe?
                      </h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Securely receive payments from customers</li>
                        <li>• Fast payouts to your bank account</li>
                        <li>• Support for multiple payment methods</li>
                        <li>• Real-time transaction tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    What you'll need:
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Bank account information
                        </p>
                        <p className="text-sm text-gray-600">
                          For receiving payouts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Government ID
                        </p>
                        <p className="text-sm text-gray-600">
                          For identity verification
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Business details
                        </p>
                        <p className="text-sm text-gray-600">
                          Address and tax information
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStripeConnect}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                        </svg>
                        Connect Stripe Account
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-4">
                  By connecting, you agree to Stripe's{" "}
                  <a
                    href="https://stripe.com/legal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Terms of Service
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
