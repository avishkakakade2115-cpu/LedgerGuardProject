
import { Request, Response, NextFunction } from "express";

type UserRole = "owner" | "admin" | "member";

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {

    // User must be authenticated first
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // Check user's role
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
      return;
    }

    next();
  };
};
