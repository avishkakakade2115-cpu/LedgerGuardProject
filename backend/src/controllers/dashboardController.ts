
import { Request, Response } from "express";

import {
  getOrganizationDashboardOverview,
} from "../services/dashboardService.js";

export const getDashboardOverview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const dashboard = await getOrganizationDashboardOverview({
      organizationId: req.user.organizationId,
      userId: req.user.userId,
    });

    res.status(200).json({
      success: true,
      message: "Dashboard overview fetched successfully",
      data: dashboard,
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    if (message === "Organization not found") {
      res.status(404).json({
        success: false,
        message,
      });
      return;
    }

    if (message === "User not found or inactive") {
      res.status(401).json({
        success: false,
        message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard overview",
    });
  }
};
