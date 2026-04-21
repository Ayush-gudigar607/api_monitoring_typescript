import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { config } from "./index";

const isProduction: boolean = config.node_env === "production";

// Common format
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Production format
const productionFormat = winston.format.combine(baseFormat);

// Development format
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
  })
);

// Create logger
export const logger: winston.Logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: isProduction ? productionFormat : developmentFormat,
  defaultMeta: { service: "api-monitoring-service" },

  transports: [
    // Error logs
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      level: "error", // ✅ FIXED
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      zippedArchive: true,
    }),

    // Combined logs
    new DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      zippedArchive: true,
    }),
  ],

  // Catch unhandled exceptions
  exceptionHandlers: [
    new DailyRotateFile({
      filename: "logs/exceptions-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      zippedArchive: true,
    }),
  ],

  // Catch unhandled promise rejections
  rejectionHandlers: [
    new DailyRotateFile({
      filename: "logs/rejections-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      zippedArchive: true,
    }),
  ],
});

// Add console logging in development
if (!isProduction) {
  logger.add(
    new winston.transports.Console({
      format: developmentFormat,
    })
  );
}