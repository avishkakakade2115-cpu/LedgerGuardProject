
import { Request, Response, NextFunction } from "express";
import { Connection } from "mongoose";

import { getTenantConnection } from "../services/tenantConnectionManager.js";

declare global {
  namespace Express {
    interface Request {
      tenantConnection?: Connection;
    }
  }
}

export const resolveTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Authentication must run before this middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // Resolve tenant using verified organization ID
    const connection = await getTenantConnection(
      req.user.organizationId
    );

    // Attach tenant connection to request
    req.tenantConnection = connection;

    next();
  } catch (error) {
    console.error("Tenant resolution error:", error);

    res.status(403).json({
      success: false,
      message: "Unable to access organization database",
    });
  }
};
