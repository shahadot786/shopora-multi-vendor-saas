"use client";

import { OtpVerification } from "@shopora/ui";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import SellerSignUpForm from "@/components/form/SellerSignUpForm";
import SellerShopForm from "@/components/form/SellerShopForm";
import StripeConnectUI from "@/components/utils/StripeConnectUI";

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

  const steps = [
    { number: 1, name: "Account" },
    { number: 2, name: "Shop Details" },
    { number: 3, name: "Payment" },
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
    onSuccess: (_, shopData) => {
      setShopData(shopData);
      setCurrentStep(3);
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
      createShopMutation.mutate(rest);
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
            <SellerSignUpForm
              accountForm={accountForm}
              isLoading={isLoading}
              handleAccountSubmit={handleAccountSubmit}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
            />
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
            <SellerShopForm
              shopForm={shopForm}
              isLoading={isLoading}
              handleShopSubmit={handleShopSubmit}
              setCurrentStep={setCurrentStep}
            />
          )}

          {/* STEP 3: Payment Setup */}
          {currentStep === 3 && (
            <StripeConnectUI
              handleStripeConnect={handleStripeConnect}
              isLoading={isLoading}
              setCurrentStep={setCurrentStep}
            />
          )}
        </div>
      </div>
    </div>
  );
}
