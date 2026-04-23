import { Request, Response, NextFunction } from "express";
import ResponseFormatter from "../utils/ResponceFormattor";

const authorize = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists
      if (!req.user || !req.user.role) {
        return res
          .status(403)
          .json(
            ResponseFormatter.error("Access denied: No role assigned", 403)
          );
      }

      // If no roles required → allow access
      if (requiredRoles.length === 0) {
        return next();
      }

      // Check role
      if (!requiredRoles.includes(req.user.role)) {
        return res
          .status(403)
          .json(
            ResponseFormatter.error(
              "Access denied: Insufficient permissions",
              403
            )
          );
      }

      // ✅ IMPORTANT: allow request to continue
      return next();

    } catch (error) {
      return res
        .status(403)
        .json(
          ResponseFormatter.error(
            "Access denied: Authorization error",
            403
          )
        );
    }
  };
};

export default authorize;