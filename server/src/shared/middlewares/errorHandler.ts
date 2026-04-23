import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import ResponseFormatter from "../utils/ResponceFormattor";

// Custom error interface (optional but useful)
interface AppError extends Error {
  statusCode?: number;
  errors?: any;
  code?: number;
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || res.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || null;

  logger.error("Error Occurred:", {
    message: err.message,
    statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // 🔍 Specific error handling
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors || {}).map((e: any) => e.message);

  } else if (err.name === "MongoServerError" && err.code === 11000) {
    statusCode = 409;
    message = "Duplicate key error";

  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";

  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  res
    .status(statusCode)
    .json(ResponseFormatter.error(message, statusCode, errors));
};

export default errorHandler;