
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export interface AuthenticatedUser {
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
      return;
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Invalid authorization header",
      });
      return;
    }

    // 3. Verify token
    const decoded = verifyToken(token);

    // 4. Attach authenticated identity to request
    req.user = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      role: decoded.role,
    };

    // 5. Continue to controller
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};
