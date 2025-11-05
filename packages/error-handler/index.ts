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

//some common errors
// not found error
export class NotFoundError extends AppError {
  constructor(message = "Resources not found!") {
    super(message, 404);
  }
}

// validation errors (use for Joi/zod/react-hook-form like validation errors)
export class ValidationError extends AppError {
  constructor(message = "Invalid request data!", details?: any) {
    super(message, 400, true, details);
  }
}

// authentication error
export class AuthError extends AppError {
  constructor(message = "Unauthorize") {
    super(message, 401);
  }
}

// forbidden error (for insufficient permissions)
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access") {
    super(message, 403);
  }
}

// database error (for mongodb/postgres errors)
export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: any) {
    super(message, 500, true, details);
  }
}

// rate limit error (if user exceeds api limits)
export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429);
  }
}
