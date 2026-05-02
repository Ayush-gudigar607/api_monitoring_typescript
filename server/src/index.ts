import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import {config} from "./shared/config/index";
import mongodb from "./shared/config/mongodb";
import postgres from "./shared/config/postgres";
import rabbitmq from "./shared/config/rabbitmq";
import { logger } from "./shared/config/logger";
import errorHandler from "./shared/middlewares/errorHandler";
import ResponseFormatter from "./shared/utils/ResponceFormattor";

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
  next();
});

/* ================= ROUTES ================= */

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json(
    ResponseFormatter.success(
      {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      "Service is healthy"
    )
  );
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json(
    ResponseFormatter.success(
      {
        service: "API HIT MONITORING SERVICE",
        version: "1.0.0",
        endpoints: {
          health: "/health",
          auth: "/auth",
          ingest: "/ingest",
          analytics: "/analytics",
        },
      },
      "Service information"
    )
  );
});

/* ================= 404 ================= */

app.use((req: Request, res: Response) => {
  res.status(404).json(ResponseFormatter.error("Endpoint not found", 404));
});

/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

/* ================= CONNECTION ================= */

async function initializeConnection(): Promise<void> {
  try {
    logger.info("Starting API Hit Monitoring Service...");

    await mongodb.connect();
    await postgres.testConnection();
    await rabbitmq.connect();

    logger.info("All services connected successfully. Starting server...");
  } catch (error: any) {
    logger.error("Failed to initialize connections", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/* ================= SERVER ================= */

async function startServer(): Promise<void> {
  try {
    await initializeConnection();

    const server = app.listen(config.port, () => {
      logger.info(
        `API Hit Monitoring Service is running on port ${config.port}`
      );
      logger.info(`Environment: ${config.node_env}`);
      logger.info(`API available at: http://localhost:${config.port}`);
    });

    /* ================= GRACEFUL SHUTDOWN ================= */

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await mongodb.disconnect();
          await postgres.close();
          await rabbitmq.close();

          logger.info("All connections closed, exiting process");
          process.exit(0);
        } catch (error: any) {
          logger.error("Error during shutdown:", error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error("Forced shutdown");
        process.exit(1);
      }, 10000);
    };

    /* ================= FIXED SIGNAL HANDLING ================= */

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    /* ================= GLOBAL ERRORS ================= */

    process.on("uncaughtException", (error: Error) => {
      logger.error("Uncaught Exception:", {
        message: error.message,
        stack: error.stack,
      });
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    process.on(
      "unhandledRejection",
      (reason: unknown, promise: Promise<any>) => {
        logger.error("Unhandled Rejection at:", {
          promise,
          reason,
        });
        gracefulShutdown("UNHANDLED_REJECTION");
      }
    );
  } catch (error: any) {
    logger.error("Failed to start server", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

/* ================= START ================= */

startServer();
