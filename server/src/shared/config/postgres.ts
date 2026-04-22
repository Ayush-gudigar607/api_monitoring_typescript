import pg, { Pool, QueryResult, QueryResultRow } from "pg";
import { config } from "./index";
import { logger } from "./logger";

class PostgresConnection {
  private pool: Pool | null;

  constructor() {
    this.pool = null;

    // ✅ Graceful shutdown
    process.on("SIGINT", async () => {
      await this.close();
      process.exit(0);
    });
  }

  private handleError(error: unknown): Error {
    return error instanceof Error
      ? error
      : new Error("Unknown PostgreSQL error");
  }

  getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool({
        host: config.pg_host,
        port: config.pg_port,
        database: config.pg_database,
        user: config.pg_user,
        password: config.pg_password,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.pool.on("error", (err: Error) => {
        logger.error("Unexpected error on idle PG client", {
          message: err.message,
          stack: err.stack,
        });
      });

      logger.info("PostgreSQL pool created");
    }

    return this.pool;
  }

  async testConnection(): Promise<void> {
    const pool = this.getPool();
    const client = await pool.connect();

    try {
      const result = await client.query("SELECT NOW()");
      logger.info(`PG connected successfully at ${result.rows[0].now}`);
    } catch (error: unknown) {
      const err = this.handleError(error);

      logger.error("Failed to connect to PG", {
        message: err.message,
        stack: err.stack,
      });

      throw err;
    } finally {
      client.release(); 
    }
  }

  async query<T extends QueryResultRow = any>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    const pool = this.getPool();
    const start = Date.now();

    try {
      const result = await pool.query<T>(text, params);
      const duration = Date.now() - start;

      logger.debug("Executed query", {
        duration,
        rows: result.rowCount,
      }); 

      return result;
    } catch (error: unknown) {
      const err = this.handleError(error);

      logger.error("Query error", {
        message: err.message,
      });

      throw err;
    }
  }

  async connectWithRetry(
    retries: number = 5,
    delay: number = 5000
  ): Promise<Pool> {
    try {
      const pool = this.getPool();

      const client = await pool.connect();
      client.release();

      logger.info("PostgreSQL connection established");

      return pool;
    } catch (error: unknown) {
      const err = this.handleError(error);

      if (retries > 0) {
        logger.warn(
          `PostgreSQL connection failed. Retrying in ${
            delay / 1000
          }s... (${retries} retries left)`,
          { message: err.message }
        );

        await new Promise((res) => setTimeout(res, delay));

        return this.connectWithRetry(retries - 1, delay);
      }

      logger.error("PostgreSQL connection failed after retries", {
        message: err.message,
        stack: err.stack,
      });

      throw err;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      await this.pool.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.end();
        this.pool = null;

        logger.info("PostgreSQL pool closed");
      }
    } catch (error: unknown) {
      const err = this.handleError(error);

      logger.error("Error closing PostgreSQL pool", {
        message: err.message,
        stack: err.stack,
      });

      throw err;
    }
  }
}

export default new PostgresConnection();