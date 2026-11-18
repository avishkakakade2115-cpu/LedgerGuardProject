
import { Router, Request, Response } from "express";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { resolveTenant } from "../middleware/tenantMiddleware.js";

const router = Router();

router.get(
  "/connection",
  authenticateUser,
  resolveTenant,
  (req: Request, res: Response): void => {
    const connection = req.tenantConnection;

    if (!connection || !req.user) {
      res.status(500).json({
        success: false,
        message: "Tenant connection not available",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Tenant connection resolved successfully",
      data: {
        userId: req.user.userId,
        organizationId: req.user.organizationId,
        role: req.user.role,
        databaseName: connection.name,
        connectionState: connection.readyState,
      },
    });
  }
);

export default router;
