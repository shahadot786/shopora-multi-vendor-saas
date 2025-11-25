"use client";
import ImagePlaceHolder from "@/components/shared/image-placeholder";
import { ChevronRight, Wand, X } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Controller, set, useForm } from "react-hook-form";
import Input from "../../../../../../../packages/components/input";
import ColorSelector from "../../../../../../../packages/components/color-selector";
import CustomSpecifications from "../../../../../../../packages/components/custom-specifications";
import CustomProperties from "../../../../../../../packages/components/custom-properties";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import RichTextEditor from "../../../../../../../packages/components/rich-text-editor";
import SizeSelector from "../../../../../../../packages/components/size-selector";
import Image from "next/image";
import { enhancements } from "@shopora/utils";

type DiscountFormType = {
  public_name: string;
  discountType: "percentage" | "flat" | "";
  discountValue: number;
  discountCode: string;
};

type DiscountType = DiscountFormType & { id: string };

interface UploadedImage {
  fileId: string;
  file_url: string;
}

const Page = () => {
  const [openImageModal, setOpenImageModal] = useState(false);
  const [imageLoader, setImageLoader] = useState(false);
  const [isChanged, setIsChanged] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  //get the categories
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-categories");
        return res.data;
      } catch (error) {
        console.log("Product category does not get.", error);
      }
    },
    staleTime: 5 * 60 * 1000, //cache time
    retry: 1,
  });

  //get the discounts
  const {
    data: discountData,
    isLoading: discountIsLoading,
    isError: discountIsError,
  } = useQuery({
    queryKey: ["discounts"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-discount-codes");
        return res.data.discountCodes;
      } catch (error) {
        console.log("Discount does not get.", error);
      }
    },
    staleTime: 5 * 60 * 1000, //cache time
    retry: 1,
  });

  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");
  // Watch the URL input
  const url = watch("youtube_video_url");

  const categories = data?.categories;
  const subCategoriesData = data?.subCategories;

  const subCategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const convertFileToBase64 = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) {
      return;
    }
    setImageLoader(true);
    try {
      const base64 = await convertFileToBase64(file);
      const response = await axiosInstance.post(
        "/product/api/upload-product-image",
        {
          file: base64,
        }
      );

      const uploadedImage: UploadedImage = {
        fileId: response.data.fileId,
        file_url: response.data.file_url,
      };

      const updateImages = [...images];

      updateImages[index] = uploadedImage;

      if (index === images.length - 1 && images.length < 8) {
        updateImages.push(null);
      }
      setImages(updateImages);
      setValue("images", updateImages);
      setImageLoader(false);
    } catch (error) {
      setImageLoader(false);
      console.log(error);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const updateImages = [...images];
      const imageToDelete = updateImages[index];
      if (imageToDelete && typeof imageToDelete === "object") {
        await axiosInstance.delete(`/product/api/delete-product-image`, {
          data: {
            fileId: imageToDelete.fileId,
          },
        });
      }
      updateImages.splice(index, 1);

      if (!updateImages.includes(null) && updateImages.length < 8) {
        updateImages.push(null);
      }
      setImages(updateImages);
      setValue("images", updateImages);
    } catch (error) {
      console.log(error);
    }
  };

  const applyTransformation = async (transformation: string) => {
    if (!selectedImage || processing) return;
    setProcessing(true);
    setActiveEffect(transformation);

    try {
      const transformedUrl = `${selectedImage}?tr=${transformation}`;
      console.log(transformedUrl, "transfored url");
      setSelectedImage(transformedUrl);
    } catch (error) {
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };
  const handleSaveDraft = () => {};

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Product
      </h2>
      <div className="flex items-center">
        <Link href={"/dashboard"}>
          <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        </Link>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Create Product</span>
      </div>
      {/* content layout */}
      <div className="py-4 w-full flex gap-6">
        {/* left side -  image upload section */}
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceHolder
              size="765 x 850"
              setOpenImageModal={setOpenImageModal}
              setSelectedImage={setSelectedImage}
              onImageChange={handleImageChange}
              small={false}
              index={0}
              onRemove={handleRemoveImage}
              images={images}
              imageLoader={imageLoader}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceHolder
                key={index}
                size="765 x 850"
                setOpenImageModal={setOpenImageModal}
                setSelectedImage={setSelectedImage}
                onImageChange={handleImageChange}
                small
                index={index + 1}
                onRemove={handleRemoveImage}
                images={images}
                imageLoader={imageLoader}
              />
            ))}
          </div>
        </div>
        {/* right side - form inputs */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* product title input */}
            <div className="w-2/4">
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register("title", { required: "Title is required!" })}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}
              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short descriptions * (Max 150 words)"
                  placeholder="Enter product description for quick view"
                  {...register("description", {
                    required: "Description is required",
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount > 150 ||
                        `Description cannot exceed 150 words (Current: ${wordCount})`
                      );
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="apple, flagship, mobile"
                  {...register("tags", {
                    required: "Separate related products tags with a comma,",
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Warranty *"
                  placeholder="1 Year / No Warranty"
                  {...register("warranty", {
                    required: "Warranty is required",
                  })}
                />
                {errors.warranty && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.warranty.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product_slug"
                  {...register("slug", {
                    required: "Slug is required",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        "Invalid slug format! Use only lowercase letters, numbers, and underscore.",
                    },
                    minLength: {
                      value: 3,
                      message: "Slug must be at least 3 characters long.",
                    },
                    maxLength: {
                      value: 50,
                      message: "Slug cannot be longer than 50 characters.",
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Brand"
                  placeholder="Apple"
                  {...register("brand")}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.brand.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                {/* color selector */}
                <ColorSelector control={control} errors={errors} />
              </div>
              {/* custom specification */}
              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>
              {/* custom properties */}
              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash On Delivery *
                </label>
                <select
                  defaultValue="yes"
                  className="w-full border outline-none border-gray-700 bg-transparent rounded-md p-1"
                  {...register("cash_on_delivery", {
                    required: "Cash on delivery is required.",
                  })}
                >
                  <option value="yes" className="bg-black">
                    Yes
                  </option>
                  <option value="no" className="bg-black">
                    No
                  </option>
                </select>
                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </div>
            </div>
            <div className="w-2/4">
              <label className="block font-semibold text-gray-300 mb-1">
                Category *
              </label>
              {isLoading ? (
                <p className="text-gray-400">Loading Categories..</p>
              ) : isError ? (
                <p className="text-red-500">Failed to load categories.</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required." }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent rounded-md p-1"
                    >
                      <option value="" className="bg-black">
                        Select Category
                      </option>
                      {categories?.map((category: string) => (
                        <option
                          key={category}
                          value={category}
                          className="bg-black"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Sub Category *
                </label>
                {isLoading ? (
                  <p className="text-gray-400">Loading Sub Categories..</p>
                ) : isError ? (
                  <p className="text-red-500">Failed to load sub categories.</p>
                ) : (
                  <Controller
                    name="subcategory"
                    control={control}
                    rules={{ required: "Sub Category is required." }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full border outline-none border-gray-700 bg-transparent rounded-md p-1"
                      >
                        <option value="" className="bg-black">
                          Select Sub Category
                        </option>
                        {subCategories?.map((subcategory: string) => (
                          <option
                            key={subcategory}
                            value={subcategory}
                            className="bg-black"
                          >
                            {subcategory}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                )}
                {errors.subcategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subcategory.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed Description * (Min 100 words)
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "Detailed description is required.",
                    validate: (val) => {
                      const wordCount = val
                        ?.split(/\s+/)
                        ?.filter((word: string) => word).length;
                      return (
                        wordCount < 100 ||
                        "Description must be at least 100 words"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                {errors.detailed_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="YouTube Video URL"
                  placeholder="https://www.youtube.com/embed/asdf123"
                  {...register("youtube_video_url", {
                    pattern: {
                      value:
                        /^https:\/\/(www\.)?youtube\.com\/embed\/[A-Za-z0-9_-]+$/,
                      message: "Please enter a valid YouTube embed URL",
                    },
                  })}
                />
                {errors.youtube_video_url && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.youtube_video_url.message as string}
                  </p>
                )}
              </div>
              {url && (
                <div className="mt-2">
                  <p className="text-sm text-gray-400 mb-2">Video Preview:</p>
                  <iframe
                    width="100%"
                    height="300"
                    src={url}
                    title="YouTube video preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg border border-gray-700"
                  ></iframe>
                </div>
              )}
              <div className="mt-2">
                <Input
                  label="Regular Price *"
                  placeholder="$20"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Price must be at least $1" },
                    validate: (val) =>
                      !isNaN(val) || "Only number are allowed.",
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Sale Price *"
                  placeholder="$15"
                  {...register("sale_price", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Sale Price must be at least $1",
                    },
                    validate: (val) => {
                      if (!isNaN(val)) return "Only number are allowed.";
                      if (regularPrice && val > regularPrice) {
                        return "Sale price must be less than Regular price.";
                      }
                      return true;
                    },
                  })}
                />
                {errors.sale_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sale_price.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="100"
                  {...register("stock", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Stock must be at least 1",
                    },
                    max: {
                      value: 1000,
                      message: "Stock cannot exceed 1,000",
                    },
                    validate: (val) => {
                      if (!isNaN(val)) return "Only number are allowed.";
                      if (!Number.isInteger(val))
                        return "Stock must be a whole number.";
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>
              <div className="mt-2">
                <SizeSelector control={control} errors={errors} />
              </div>
              <div className="mt-3">
                <label className="block font-semibold text-gray-300 mb-1">
                  Select Discount Codes (optional)
                </label>
                {discountIsLoading ? (
                  <p className="text-gray-400">Loading Discount..</p>
                ) : discountIsError ? (
                  <p className="text-red-500">Failed to load discount.</p>
                ) : (
                  <Controller
                    name="discount_codes"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full border outline-none border-gray-700 bg-transparent rounded-md p-1"
                      >
                        <option value="" className="bg-black">
                          Select Discount
                        </option>

                        {discountData?.map((discount: DiscountType) => (
                          <option
                            key={discount.id}
                            value={discount.discountCode}
                            className="bg-black"
                          >
                            {`${discount.discountCode.split("_").join(" ")} (${
                              discount.discountType === "percentage"
                                ? discount.discountValue + "%"
                                : "$" + discount.discountValue
                            })`}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                )}
                {errors.discount_codes && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discount_codes.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {openImageModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800  p-6 rounded-lg w-[450px] text-white">
            <div className="flex justify-between items-center pb-3 mb-4">
              <h2 className="text-lg font-semibold">Enhance Product Image</h2>
              <X
                size={20}
                className="cursor-pointer"
                onClick={() => setOpenImageModal(!openImageModal)}
              />
            </div>
            <div className="relative w-full h-[250px] rounded-md overflow-hidden border border-gray-600">
              <Image src={selectedImage} layout="fill" alt="Enhanced Image" />
            </div>
            {selectedImage && (
              <div className="mt-4 space-y-2">
                <h3 className="text-white text-sm font-semibold">
                  AI Enhancements
                </h3>
                <div className="grid grid-cols-2 gap-3 mx-h-[250px] overflow-y-auto">
                  {enhancements.map(({ label, effect }) => (
                    <button
                      key={effect}
                      className={`p-2 rounded-md flex items-center gap-2 ${
                        activeEffect === effect
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                      onClick={() => applyTransformation(effect)}
                      disabled={processing}
                    >
                      <Wand size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        {isChanged && (
          <button
            type="button"
            className="px-4 py-2 bg-gray-700 text-white rounded-md"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
        )}
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default Page;
