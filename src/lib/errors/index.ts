// ============================================================================
// Habesha Home — Typed Application Errors
// ============================================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "You do not have permission to perform this action") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(
    message: string = "Validation failed",
    errors: Record<string, string[]> = {}
  ) {
    super(message, 400, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, "CONFLICT_ERROR");
  }
}

export class PaymentError extends AppError {
  public readonly providerError?: string;

  constructor(message: string = "Payment failed", providerError?: string) {
    super(message, 402, "PAYMENT_ERROR");
    this.providerError = providerError;
  }
}

export class BookingError extends AppError {
  constructor(message: string = "Booking operation failed") {
    super(message, 422, "BOOKING_ERROR");
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests. Please try again later.") {
    super(message, 429, "RATE_LIMIT_ERROR");
  }
}

/**
 * Type guard to check if an error is an operational AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Safe error message for client — never expose internal details
 */
export function getClientErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}

/**
 * Safe error response for API/Server Actions
 */
export function createErrorResponse(error: unknown) {
  if (isAppError(error)) {
    return {
      success: false as const,
      error: {
        message: error.message,
        code: error.code,
        ...(error instanceof ValidationError ? { errors: error.errors } : {}),
      },
    };
  }

  console.error("Unhandled error:", error);

  return {
    success: false as const,
    error: {
      message: "An unexpected error occurred. Please try again.",
      code: "INTERNAL_ERROR",
    },
  };
}

/**
 * Successful response wrapper
 */
export function createSuccessResponse<T>(data: T) {
  return {
    success: true as const,
    data,
  };
}

export type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: { message: string; code: string; errors?: Record<string, string[]> } };
