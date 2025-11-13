import {
  BUSINESS_TYPES,
  COUNTRIES,
  OPENING_HOURS_OPTIONS,
  SHOP_CATEGORIES,
} from "@shopora/constants";
import React from "react";

interface SellerShopFormProps {
  shopForm: any;
  isLoading: boolean;
  handleShopSubmit: (data: any) => void;
  setCurrentStep: (step: number) => void;
}

const SellerShopForm = ({
  shopForm,
  isLoading,
  handleShopSubmit,
  setCurrentStep,
}: SellerShopFormProps) => {
  return (
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
        <h2 className="text-3xl font-bold text-gray-900">Setup Your Shop</h2>
        <p className="text-gray-600 mt-2">Tell us about your business</p>
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
                value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/,
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
  );
};

export default SellerShopForm;
