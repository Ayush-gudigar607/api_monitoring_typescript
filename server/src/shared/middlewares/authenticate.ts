import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ResponseFormatter from "../utils/ResponceFormattor";
import { logger } from "../config/logger";
import { config } from "../config";

// Define JWT payload type
interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  clientId?: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}


const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | null = null;

    // 1. Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. Check cookies (fallback)
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json(ResponseFormatter.error("Authentication token missing", 401));
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt_secret) as JwtPayload;

    const { userId, email, username, role, clientId } = decoded;

    req.user = { userId, email, username, role, clientId };

    logger.info("Authenticated User", {
      userId,
      email,
      username,
      role,
      clientId,
    });

    next();
  } catch (error: any) {
    logger.error("Authentication Error", {
      message: error.message,
      stack: error.stack,
    });

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json(ResponseFormatter.error("Authentication token expired", 401));
    }

    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json(ResponseFormatter.error("Invalid authentication token", 401));
    }

    return res
      .status(401)
      .json(ResponseFormatter.error("Invalid authentication token", 401));
  }
};

export default authenticate;