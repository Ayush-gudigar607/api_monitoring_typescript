import mongoose, { Connection } from "mongoose";
import { logger } from "./logger";
import { config } from "./index";

class MongoConnection {
  private connection: Connection | null;
  private isConnected: boolean;

  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect(): Promise<Connection> {
    try {
      if (this.connection && this.isConnected) {
        logger.info("Already connected to MongoDB");
        return this.connection;
      }

      await mongoose.connect(config.mongo_uri, {
        dbName: config.mongo_db_name,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.connection = mongoose.connection;
      this.isConnected = true;

      logger.info("Connected to MongoDB successfully", {
        db: config.mongo_db_name,
      });

      // Event listeners
      this.connection.on("connected", () => {
        logger.info("MongoDB connection established", {
          db: config.mongo_db_name,
        });
      });

      this.connection.on("error", (err: unknown) => {
        logger.error("MongoDB connection error", {
          error: err,
          db: config.mongo_db_name,
        });
      });

      this.connection.on("disconnected", () => {
        logger.info("MongoDB connection disconnected", {
          db: config.mongo_db_name,
        });
      });

      // Graceful shutdown
      process.on("SIGINT", async () => {
        await this.close();
        process.exit(0);
      });

      return this.connection;
    } catch (error: unknown) {
      logger.error("Error connecting to MongoDB", {
        error,
        db: config.mongo_db_name,
      });
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.close();
      this.connection = null;
      this.isConnected = false;

      logger.info("MongoDB connection closed", {
        db: config.mongo_db_name,
      });
    }
  }

  async connectWithRetry(
    retries: number = 5,
    delay: number = 5000
  ): Promise<Connection> {
    try {
      return await this.connect();
    } catch (err: unknown) {
      if (retries > 0) {
        logger.warn(
          `MongoDB retry in ${delay / 1000}s... (${retries} retries left)`
        );

        await new Promise((res) => setTimeout(res, delay));
        return this.connectWithRetry(retries - 1, delay);
      }

      const errorMessage =
        err instanceof Error ? err.message : "Unknown error";

      logger.error("MongoDB connection failed after retries", {
        message: errorMessage,
      });

      throw err;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        this.isConnected = false;

        logger.info("MongoDB disconnected successfully");
      }
    } catch (error: unknown) {
      const err = error as Error;

      logger.error("Failed to disconnect from MongoDB", {
        message: err.message,
        stack: err.stack,
      });

      throw error;
    }
  }

  getConnection(): Connection | null {
    return this.connection;
  }
}

export default new MongoConnection();