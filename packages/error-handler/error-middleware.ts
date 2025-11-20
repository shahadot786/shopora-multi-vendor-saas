import { AppError } from "./index";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle known AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Prisma Errors (auto mapped)
  if (err.code?.startsWith("P")) {
    return res.status(500).json({
      success: false,
      message: "Database error occurred",
      code: err.code,
      details: err.meta,
    });
  }

  // Zod / Joi / Yup style validation errors
  if (err.name === "ZodError" || err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Invalid data format",
      issues: err.errors || err.details,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  // Multer / File upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large",
    });
  }

  // Fallback Unhandled Error
  console.error("Unhandled Error:", err);

  return res.status(500).json({
    success: false,
    message: "Something went wrong, please try again!",
  });
};
