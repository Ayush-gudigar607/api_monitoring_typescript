import { Request, Response, NextFunction } from "express";
import { config } from "../../../shared/config/index.js";
import ResponseFormatter from "../../../shared/utils/ResponceFormattor.js";
import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";

/* ================= TYPES ================= */

interface AuthService {
  onboardSuperAdmin(data: any): Promise<{ user: any; token: string }>;
  register(data: any): Promise<{ user: any; token: string }>;
  login(username: string, password: string): Promise<{ user: any; token: string }>;
  getProfile(userId: string): Promise<any>;
}

/* ================= CONTROLLER ================= */

export class AuthController {
  private authservice: AuthService;

  constructor(authservice: AuthService) {
    if (!authservice) {
      throw new Error("AuthService is required");
    }
    this.authservice = authservice;
  }

  private setCookie(res: Response, token: string): void {
    res.cookie("token", token, {
      httpOnly: config.httpOnly,
      secure: config.secure,
      maxAge: config.expireIn,
    });
  }

  async onboardSuperAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { username, email, password } = req.body;

      const superAdminData = {
        username,
        email,
        password,
        role: APPLICATION_ROLES.SUPER_ADMIN,
      };

      const { token } =
        await this.authservice.onboardSuperAdmin(superAdminData);

      this.setCookie(res, token);

      res
        .status(201)
        .json(
          ResponseFormatter.success(
            null,
            "Super admin onboarded successfully",
            201
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { username, email, password, role } = req.body;

      const userData = {
        username,
        email,
        password,
        role: role || APPLICATION_ROLES.CLIENT_VIEWER,
      };

      const { token } = await this.authservice.register(userData);

      this.setCookie(res, token);

      res
        .status(201)
        .json(
          ResponseFormatter.success(
            null,
            "User registered successfully",
            201
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { username, password } = req.body;

      const { user, token } = await this.authservice.login(
        username,
        password
      );

      this.setCookie(res, token);

      res
        .status(200)
        .json(
          ResponseFormatter.success(
            user,
            "User LoggedIn Successfully",
            200
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new Error("Unauthorized");
      }

      const result = await this.authservice.getProfile(userId);

      res
        .status(200)
        .json(
          ResponseFormatter.success(
            result,
            "User profile fetched successfully",
            200
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.clearCookie("token");

      res
        .status(200)
        .json(
          ResponseFormatter.success(
            null,
            "User logged out successfully",
            200
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
