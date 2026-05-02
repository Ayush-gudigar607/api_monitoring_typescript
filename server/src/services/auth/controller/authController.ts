import { Request, Response, NextFunction } from "express";
import { config } from "../../../shared/config/index";
import { APPLICATION_ROLES } from "../../../shared/constants/roles";

export class AuthController{
    private authService: {
        onboardSuperAdmin(superAdminData: {
            username: string;
            email: string;
            password: string;
            role: string;
        }): Promise<{ token: string; user: unknown }>;
    };

    constructor(authService: AuthController["authService"]) {
        if (!authService) {
            throw new Error("AuthService is required");
        }

        this.authService = authService;
    }

    setCookie(res: Response, token: string) {
        res.cookie("token", token, {
            httpOnly: config.httpOnly,
            secure: config.secure === "true",
            maxAge: config.expireIn,
        });
    }

    async onboardSuperAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password } = req.body;
            const superAdminData = {
                username,
                email,
                password,
                role: APPLICATION_ROLES.SUPER_ADMIN,
            };

            const { token, user } = await this.authService.onboardSuperAdmin(superAdminData);

            this.setCookie(res, token);

            return res.status(201).json({
                success: true,
                token,
                user,
            });
        } catch (error) {
            return next(error);
        }
    }
}