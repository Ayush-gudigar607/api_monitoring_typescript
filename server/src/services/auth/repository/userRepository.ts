import BaseRepository from "./BaseRepository";
import User, { IUser } from "../../../shared/models/user";
import { logger } from "../../../shared/config/logger";

class MongoUserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async create(userdata: Partial<IUser>): Promise<IUser> {
    try {
      if (!userdata) {
        throw new Error("No data provided");
      }

      const data = { ...userdata };

      // Default permissions for super_admin
      if (data.role === "super_admin" && !data.permissions) {
        data.permissions = {
          canCreateApiKeys: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canExportData: true,
        };
      }

      const user = await this.model.create(data);

      logger.info("User created successfully", {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        clientId: user.clientId,
      });

      return user.toJSON(); // clean plain object (toJSON hides password)
    } catch (error) {
      logger.error("Error creating user", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async findById(id: string): Promise<IUser | null> {
    try {
      const user = await this.model.findById(id).lean();

      if (!user) {
        logger.warn("User not found by ID", { userId: id });
      }

      return user;
    } catch (error) {
      logger.error("Error finding user by ID", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: id,
      });
      throw error;
    }
  }

  async findByUsername(username: string): Promise<IUser | null> {
    try {
      const user = await this.model.findOne({ username }).lean();

      if (!user) {
        logger.warn("User not found by username", { username });
      }

      return user;
    } catch (error) {
      logger.error("Error finding user by username", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        username,
      });
      throw error;
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await this.model.findOne({ email }).lean();

      if (!user) {
        logger.warn("User not found by email", { email });
      }

      return user;
    } catch (error) {
      logger.error("Error finding user by email", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        email,
      });
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<IUser[]> {
    try {
      const skip = (page - 1) * limit;

      const users = await this.model
        .find()
        .skip(skip)
        .limit(limit)
        .lean();

      if (!users.length) {
        logger.warn("No users found for pagination", { page, limit });
      }

      return users;
    } catch (error) {
      logger.error("Error finding users with pagination", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        page,
        limit,
      });
      throw error;
    }
  }
}

export default new MongoUserRepository();
