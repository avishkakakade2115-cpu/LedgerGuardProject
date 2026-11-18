import User from "../models/User.js";
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


export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Invalid authorization header",
      });
      return;
    }

    // Verify JWT signature and expiry
    const decoded = verifyToken(token);

    // Fetch current user status from central database
    const user = await User.findById(decoded.userId);

    if (
      !user ||
      !user.isActive ||
      user.organizationId.toString() !== decoded.organizationId
    ) {
      res.status(401).json({
        success: false,
        message: "User account is unavailable",
      });
      return;
    }

    // Use current database role, not potentially outdated JWT role
    req.user = {
      userId: user._id.toString(),
      organizationId: user.organizationId.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};
