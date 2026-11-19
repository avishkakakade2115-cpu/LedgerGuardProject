
import User from "../models/User.js";
import Organization from "../models/Organization.js";
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

  let decoded;

  try {
    decoded = verifyToken(token);
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
    return;
  }

  try {
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

    const organization = await Organization.findById(
      user.organizationId
    );

    if (!organization || organization.status !== "active") {
      res.status(403).json({
        success: false,
        message: "Organization is suspended or unavailable",
      });
      return;
    }

    req.user = {
      userId: user._id.toString(),
      organizationId: user.organizationId.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to authenticate user at this time",
    });
  }
};
