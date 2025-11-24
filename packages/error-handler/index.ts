// Base AppError
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}

/* ---------------------------------------
 * 4xx — Client Errors
 * --------------------------------------*/

// 400 — Bad Request
export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: any) {
    super(message, 400, true, details);
  }
}

// 400 — Validation Error (Joi/Zod etc)
export class ValidationError extends AppError {
  constructor(message = "Invalid request data!", details?: any) {
    super(message, 400, true, details);
  }
}

// 401 — Authentication
export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

// 401 — JWT / Token Error
export class TokenError extends AppError {
  constructor(message = "Invalid or expired token") {
    super(message, 401);
  }
}

// 402 — Payment Required
export class PaymentRequiredError extends AppError {
  constructor(message = "Payment required") {
    super(message, 402);
  }
}

// 403 — Forbidden
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access") {
    super(message, 403);
  }
}

// 404 — Resource Not Found
export class NotFoundError extends AppError {
  constructor(message = "Resource not found!") {
    super(message, 404);
  }
}

// 408 — Timeout
export class TimeoutError extends AppError {
  constructor(message = "Request timeout") {
    super(message, 408);
  }
}

// 409 — Conflict (Duplicate resource, already exists)
export class ConflictError extends AppError {
  constructor(message = "Resource already exists", details?: any) {
    super(message, 409, true, details);
  }
}

// 429 — Too Many Requests
export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429);
  }
}

// 440 — Session Expired (Used by dashboards)
export class SessionExpiredError extends AppError {
  constructor(message = "Session expired") {
    super(message, 440);
  }
}

/* ---------------------------------------
 * 5xx — Server Errors
 * --------------------------------------*/

// 500 — Database Error (Mongo/Prisma/Postgres)
export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: any) {
    super(message, 500, true, details);
  }
}

// 500 — File Upload Error (S3, Cloudinary, Multer)
export class FileUploadError extends AppError {
  constructor(message = "File upload failed", details?: any) {
    super(message, 500, true, details);
  }
}

// 502 — Integration Error (External APIs)
export class IntegrationError extends AppError {
  constructor(message = "External API error", details?: any) {
    super(message, 502, true, details);
  }
}

// 413 — Payload TooLarge Error
export class PayloadTooLargeError extends AppError {
  constructor(
    message = "Payload too large. File size limit exceeded.",
    details?: any
  ) {
    super(message, 413, true, details);
  }
}

// 503 — Service Unavailable
export class ServiceUnavailableError extends AppError {
  constructor(message = "Service temporarily unavailable") {
    super(message, 503);
  }
}
