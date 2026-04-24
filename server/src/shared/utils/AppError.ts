type AppErrorOptions = {
  message?: string;
  statusCode?: number;
  code?: string;
  errors?: unknown;
  metadata?: unknown;
  isOperational?: boolean;
};

export default class AppError extends Error {
  statusCode: number;
  code: string;
  errors: unknown;
  metadata: unknown;
  isOperational: boolean;

  constructor({
    message = "Internal server error",
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    errors = null,
    metadata = null,
    isOperational = true,
  }: AppErrorOptions = {}) {
    super(message);

    this.name = new.target.name; // better than constructor.name
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.metadata = metadata;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  // Convert error into API response format
  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        errors: this.errors,
        metadata: this.metadata,
      },
    };
  }

  // 🔥 Generic factory (reduces repetition)
  private static create(
    statusCode: number,
    code: string,
    message: string,
    errors: unknown = null
  ) {
    return new AppError({ message, statusCode, code, errors });
  }

  static badRequest(message = "Bad Request", errors: unknown = null) {
    return this.create(400, "BAD_REQUEST", message, errors);
  }

  static unauthorized(message = "Unauthorized", errors: unknown = null) {
    return this.create(401, "UNAUTHORIZED", message, errors);
  }

  static forbidden(message = "Forbidden", errors: unknown = null) {
    return this.create(403, "FORBIDDEN", message, errors);
  }

  static notFound(message = "Not Found", errors: unknown = null) {
    return this.create(404, "NOT_FOUND", message, errors);
  }

  static conflict(message = "Conflict", errors: unknown = null) {
    return this.create(409, "CONFLICT", message, errors);
  }

  static internal(message = "Internal Server Error", errors: unknown = null) {
    return this.create(500, "INTERNAL_SERVER_ERROR", message, errors);
  }
}