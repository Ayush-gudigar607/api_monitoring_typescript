import { config } from "../../../shared/config/index.js";
import AppError from "../../../shared/utils/AppError.js";
import jwt from "jsonwebtoken";
import { logger } from "../../../shared/config/logger.js";
import bcrypt from "bcryptjs";
import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";
import { IUser, UserRole } from "../../../shared/models/user.js";

/* ================= TYPES ================= */

type UserType = Omit<IUser, "role"> & {
  _id?: unknown;
  role: UserRole;
};

interface UserRepository {
  findAll(page?: number, limit?: number): Promise<UserType[]>;
  findById(id: string): Promise<UserType | null>;
  findByUsername(username: string): Promise<UserType | null>;
  findByEmail(email: string): Promise<UserType | null>;
  create(data: Partial<IUser>): Promise<UserType>;
}

/* ================= SERVICE ================= */

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    if (!userRepository) {
      throw new Error("UserRepository is required");
    }
    this.userRepository = userRepository;
  }

  generateToken(user: UserType): string {
    const { _id, email, username, role, clientId } = user;

    const payload = { userId: String(_id), email, username, role, clientId };

    return jwt.sign(payload, config.jwt_secret, {
      expiresIn: config.jwt_expires_in as jwt.SignOptions["expiresIn"],
    });
  }

  formatUserForResponse(user: UserType) {
    const userObj: Partial<UserType> = { ...user };
    delete userObj.password;
    return userObj;
  }

  async comparePassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(candidatePassword, userPassword);
  }

  /* ================= SUPER ADMIN ================= */

  async onboardSuperAdmin(superAdminData: UserType) {
    try {
      const existingUsers = await this.userRepository.findAll();

      if (existingUsers.length > 0) {
        throw AppError.forbidden("Super admin onboarding is disabled");
      }

      // 🔥 hash password
      superAdminData.password = await bcrypt.hash(
        superAdminData.password,
        10
      );

      const user = await this.userRepository.create(superAdminData);
      const token = this.generateToken(user);

      logger.info("Super admin onboarded successfully", {
        userId: user.username,
      });

      return {
        user: this.formatUserForResponse(user),
        token,
      };
    } catch (error) {
      logger.error("Error occurred while onboarding super admin", { error });
      throw error;
    }
  }

  /* ================= REGISTER ================= */

  async register(userData: UserType) {
    try {
      const existingUser = await this.userRepository.findByUsername(
        userData.username
      );
      if (existingUser) {
        throw AppError.badRequest("Username already in use");
      }

      const existingEmail = await this.userRepository.findByEmail(
        userData.email
      );
      if (existingEmail) {
        throw AppError.conflict("Email already in use");
      }

      // 🔥 hash password
      userData.password = await bcrypt.hash(userData.password, 10);

      const user = await this.userRepository.create(userData);
      const token = this.generateToken(user);

      logger.info("User registered successfully", {
        userId: user.username,
      });

      return {
        user: this.formatUserForResponse(user),
        token,
      };
    } catch (error) {
      logger.error("Error occurred during user registration", { error });
      throw error;
    }
  }

  /* ================= LOGIN ================= */

  async login(username: string, password: string) {
    try {
      const user = await this.userRepository.findByUsername(username);

      if (!user) {
        throw AppError.unauthorized("Invalid username or password");
      }

      if (user.isActive === false) {
        throw AppError.forbidden("User account is deactivated");
      }

      const isPasswordValid = await this.comparePassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        throw AppError.unauthorized("Invalid username or password");
      }

      const token = this.generateToken(user);

      logger.info("User logged in successfully", {
        userId: user.username,
      });

      return {
        user: this.formatUserForResponse(user),
        token,
      };
    } catch (error) {
      logger.error("Error occurred during user login", { error });
      throw error;
    }
  }

  /* ================= PROFILE ================= */

  async getProfile(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw AppError.notFound("User not found");
      }

      return this.formatUserForResponse(user);
    } catch (error) {
      logger.error("Error occurred while fetching user profile", { error });
      throw error;
    }
  }

  /* ================= ROLE CHECK ================= */

  async checkSuperAdminPermissions(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw AppError.notFound("User not found");
      }

      return user.role === APPLICATION_ROLES.SUPER_ADMIN;
    } catch (error) {
      logger.error(
        "Error occurred while checking super admin permissions",
        { error }
      );
      throw error;
    }
  }
}
