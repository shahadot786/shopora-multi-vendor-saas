"use client";
import ImagePlaceHolder from "@/components/shared/image-placeholder";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../../../../../packages/components/input";

const Page = () => {
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const handleImageChange = (file: File | null, index: number) => {
    const updateImages = [...images];
    updateImages[index] = file;

    if (index === images.length - 1 && images.length < 8) {
      updateImages.push(null);
    }

    setImages(updateImages);
    setValue("images", updateImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      let updateImages = [...prevImages];
      if (index === -1) {
        updateImages[0] = null;
      } else {
        updateImages.splice(index, 1);
      }

      if (!updateImages.includes(null) && updateImages.length < 8) {
        updateImages.push(null);
      }
      return updateImages;
    });

    setValue("images", images);
  };
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
              onImageChange={handleImageChange}
              small={false}
              index={0}
              onRemove={handleRemoveImage}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceHolder
                key={index}
                size="765 x 850"
                setOpenImageModal={setOpenImageModal}
                onImageChange={handleImageChange}
                small
                index={index + 1}
                onRemove={handleRemoveImage}
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
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Page;
