"use client";

import { Plus, X, Trash2, Edit, Search, ChevronRight } from "lucide-react";
import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import { DeleteModal } from "../../../../../../../packages/components/modal/delete.modal";

type DiscountFormType = {
  public_name: string;
  discountType: "percentage" | "flat" | "";
  discountValue: number;
  discountCode: string;
};

type DiscountType = DiscountFormType & { id: string };

const fetchDiscounts = async (): Promise<DiscountType[]> => {
  const res = await axiosInstance.get("/product/api/get-discount-codes");
  return res.data.discountCodes;
};

const createDiscount = async (data: DiscountFormType) => {
  const res = await axiosInstance.post(
    "/product/api/create-discount-codes",
    data
  );
  return res.data;
};

const updateDiscount = async (data: DiscountType) => {
  const res = await axiosInstance.put(
    `/product/api/update-discount-code/${data.id}`,
    data
  );
  return res.data;
};

const deleteDiscount = async (id: string) => {
  const res = await axiosInstance.delete(
    `/product/api/delete-discount-code/${id}`
  );
  return res.data;
};

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editData, setEditData] = useState<DiscountType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [operationInProgress, setOperationInProgress] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DiscountFormType>({
    defaultValues: {
      public_name: "",
      discountType: "",
      discountValue: 0,
      discountCode: "",
    },
  });

  // Fetch discounts with refetch on window focus for real-time updates
  const {
    data: discounts = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["discounts"],
    queryFn: fetchDiscounts,
    staleTime: 5 * 60 * 1000, //cache time
    retry: 1,
  });

  // Filter discounts based on search
  const filteredDiscounts = useMemo(() => {
    if (!searchTerm) return discounts;
    const term = searchTerm.toLowerCase();
    return discounts.filter(
      (d) =>
        d.public_name.toLowerCase().includes(term) ||
        d.discountCode.toLowerCase().includes(term) ||
        d.discountType.toLowerCase().includes(term)
    );
  }, [discounts, searchTerm]);

  const onSubmit = async (data: DiscountFormType) => {
    setOperationInProgress(true);
    try {
      if (editData) {
        await updateDiscount({ ...data, id: editData.id } as DiscountType);
        toast.success("Discount updated successfully!");
      } else {
        await createDiscount(data);
        toast.success("Discount created successfully!");
      }

      // Immediately refetch to update UI
      await refetch();
      closeModal();
    } catch (error: any) {
      toast.error(error.message || "Failed to save discount");
    } finally {
      setOperationInProgress(false);
    }
  };

  const handleEdit = (discount: DiscountType) => {
    setEditData(discount);
    setValue("public_name", discount.public_name);
    setValue("discountType", discount.discountType);
    setValue("discountValue", discount.discountValue);
    setValue("discountCode", discount.discountCode);
    setShowModal(true);
  };
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setOperationInProgress(true);
    try {
      await deleteDiscount(deleteTarget.id);
      toast.success("Discount deleted successfully!");
      await refetch();
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete discount");
    } finally {
      setOperationInProgress(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const closeModal = () => {
    setShowModal(false);
    reset();
    setEditData(null);
  };

  const openCreateModal = () => {
    reset();
    setEditData(null);
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    if (discounts?.length >= 10) {
      toast.error("You can't create more than 10 discounts");
      return;
    }
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  return (
    <div className="w-full min-h-screen p-4 sm:p-8 bg-[#101010]">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl text-white font-semibold">
            Discount Coupons
          </h2>
          <button
            onClick={openCreateModal}
            disabled={operationInProgress}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} /> Create Discount
          </button>
        </div>

        <div className="flex items-center mb-3">
          <Link href={"/dashboard"}>
            <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
          </Link>
          <ChevronRight size={20} className="opacity-[.8] text-white" />
          <span className="text-white">Create Coupons</span>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, code, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : isError ? (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
            Failed to load discounts. Please try again.
          </div>
        ) : filteredDiscounts.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full text-white">
              <thead>
                <tr className="bg-gray-800">
                  <th className="p-3 text-left border-b border-gray-700">
                    Public Name
                  </th>
                  <th className="p-3 text-left border-b border-gray-700">
                    Type
                  </th>
                  <th className="p-3 text-left border-b border-gray-700">
                    Value
                  </th>
                  <th className="p-3 text-left border-b border-gray-700">
                    Code
                  </th>
                  <th className="p-3 text-center border-b border-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDiscounts.map((d) => (
                  <tr
                    key={d.id}
                    className="bg-gray-900 hover:bg-gray-800 transition-colors"
                  >
                    <td className="p-3 border-b border-gray-800">
                      {d.public_name}
                    </td>
                    <td className="p-3 border-b border-gray-800 capitalize">
                      {d.discountType}
                    </td>
                    <td className="p-3 border-b border-gray-800">
                      {d.discountType === "percentage"
                        ? `${d.discountValue}%`
                        : `$${d.discountValue}`}
                    </td>
                    <td className="p-3 border-b border-gray-800">
                      <code className="bg-gray-700 px-2 py-1 rounded text-sm">
                        {d.discountCode}
                      </code>
                    </td>
                    <td className="p-3 border-b border-gray-800">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(d)}
                          disabled={operationInProgress}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-700 text-black rounded hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit discount"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(d.id, d.public_name)}
                          disabled={operationInProgress}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete discount"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {searchTerm
                ? "No discounts match your search."
                : "No discount codes yet."}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 w-full max-w-md rounded-lg p-6 relative shadow-xl border border-gray-700">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-6 text-white">
              {editData ? "Edit Discount Coupon" : "Create Discount Coupon"}
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-medium mb-1 text-gray-300">
                  Public Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("public_name", {
                    required: "Public name is required",
                    minLength: {
                      value: 2,
                      message: "Must be at least 2 characters",
                    },
                  })}
                  className="w-full p-2 rounded-md bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., SUMMER2025"
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.toUpperCase();
                  }}
                />
                {errors.public_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.public_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("discountType", {
                    required: "Discount type is required",
                  })}
                  className="w-full p-2 rounded-md bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount ($)</option>
                </select>
                {errors.discountType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discountType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("discountValue", {
                    required: "Discount value is required",
                    min: { value: 0.01, message: "Must be greater than 0" },
                    valueAsNumber: true,
                  })}
                  className="w-full p-2 rounded-md bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10 or 25.50"
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-1 text-gray-300">
                  Discount Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("discountCode", {
                    required: "Discount code is required",
                    minLength: {
                      value: 3,
                      message: "Must be at least 3 characters",
                    },
                  })}
                  className="w-full p-2 rounded-md bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., summer_code_2025"
                />
                {errors.discountCode && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discountCode.message}
                  </p>
                )}
              </div>

              <button
                onClick={handleFormSubmit}
                disabled={operationInProgress}
                className="w-full bg-blue-600 text-white p-2 rounded-md mt-4 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationInProgress
                  ? "Saving..."
                  : editData
                  ? "Update Discount"
                  : "Save Discount"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* show delete modal */}
      {showDeleteModal && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Discount Code"
          message="Are you sure you want to delete this discount code?"
        />
      )}
    </div>
  );
};

export default Page;
