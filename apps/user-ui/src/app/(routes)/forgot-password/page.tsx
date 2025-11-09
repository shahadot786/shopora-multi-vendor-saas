"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

type FormData = {
  email: string;
};

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<FormData>({
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Client-side validation
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

    return true;
  };

  // login mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-forgot-password`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      router.push("/");
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      // Trim whitespace
      const sanitizedData = {
        email: data.email.trim().toLowerCase(),
      };

      forgotPasswordMutation.mutate(sanitizedData);
    } catch (error: any) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] w-full p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-6">
            Forgot Password
          </h3>

          <div className="space-y-4">
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
            {/* forgot password Button */}
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Forgot Password
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Have an account?{" "}
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
  );
};

export default ForgotPassword;
