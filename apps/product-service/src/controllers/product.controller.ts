import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";

//get product categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_configs.findFirst();
    if (!config) {
      return res.status(404).json({ message: "Categories not found." });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

//create discount codes
export const createDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    if (!public_name || !discountType || !discountValue || !discountCode) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const isDiscountCodeExists = await prisma.discount_coupon.findUnique({
      where: { discountCode },
    });

    if (isDiscountCodeExists) {
      return res.status(400).json({ message: "Discount code already exists." });
    }

    const newDiscountCode = await prisma.discount_coupon.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Discount code created successfully.",
      discountCode: newDiscountCode,
    });
  } catch (error) {
    return next(error);
  }
};

//get discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discountCodes = await prisma.discount_coupon.findMany({
      where: { sellerId: req.seller.id },
    });
    return res.status(200).json({ success: true, discountCodes });
  } catch (error) {
    return next(error);
  }
};

//update discount codes
export const updateDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { public_name, discountType, discountValue, discountCode } = req.body;

    // Build the update data object dynamically
    const updateData: any = {};
    if (public_name) updateData.public_name = public_name;
    if (discountType) updateData.discountType = discountType;
    if (discountValue !== undefined)
      updateData.discountValue = parseFloat(discountValue);

    if (discountCode) {
      // Check uniqueness only if discountCode is being updated
      const isDiscountCodeExists = await prisma.discount_coupon.findUnique({
        where: { discountCode },
      });

      // If the existing code belongs to a different record, throw error
      if (isDiscountCodeExists && isDiscountCodeExists.id !== id) {
        return res
          .status(400)
          .json({ message: "Discount code already exists." });
      }

      updateData.discountCode = discountCode;
    }

    const updatedDiscountCode = await prisma.discount_coupon.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Discount code updated successfully.",
      discountCode: updatedDiscountCode,
    });
  } catch (error) {
    return next(error);
  }
};

//delete discount code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;
    const discountCode = await prisma.discount_coupon.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!discountCode) {
      return next(new NotFoundError("Discount code not found."));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError("Discount code not found."));
    }

    await prisma.discount_coupon.delete({
      where: { id },
    });
    return res.status(200).json({
      success: true,
      message: "Discount code deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

// upload product image
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { file } = req.body;
    const response = await imagekit.files.upload({
      file,
      fileName: `product-image${Date.now()}.jpg`,
      folder: "/products",
    });
    return res.status(201).json({
      success: true,
      file_url: response.url,
      fileId: response.fileId,
      message: "Product image uploaded successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

// delete product image
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;
    const response = await imagekit.files.delete(fileId);
    return res.status(201).json({
      success: true,
      response,
      message: "Product image deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

// create product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      brand,
      cash_on_delivery,
      category,
      colors = [],
      customProperties = [],
      custom_specifications,
      description,
      detailed_description,
      discount_codes,
      images = [],
      regular_price,
      sale_price,
      sizes = [],
      slug,
      stock,
      subcategory,
      tags,
      title,
      warranty,
      youtube_video_url,
    } = req.body;

    if (
      !title ||
      !slug ||
      !description ||
      !images ||
      !stock ||
      !regular_price ||
      !sale_price ||
      !category ||
      !subcategory ||
      !tags
    ) {
      return next(new ValidationError("Missing required fields."));
    }

    if (!req.seller.id) {
      return next(new AuthError("Seller not found."));
    }

    const slugChecking = await prisma.products.findUnique({
      where: { slug },
    });

    if (slugChecking) {
      return next(new ValidationError("Slug already exists."));
    }
    const product = await prisma.products.create({
        data: {
          brand,
          cash_on_delivery,
          category,
          colors,
          customProperties,
          custom_specifications,
          description,
          detailed_description,
          discount_codes,
          images,
          regular_price,
          sale_price,
          sizes,
          slug,
          stock,
          subcategory,
          tags,
          title,
          warranty,
          youtube_video_url,
        },
      });
      return res.status(201).json({
        success: true,
        message: "Product created successfully.",
        product,
      });
      
    
  } catch (error) {
    return next(error);
  }
};
