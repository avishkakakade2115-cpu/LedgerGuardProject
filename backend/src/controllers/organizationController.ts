import { Request, Response } from "express";
import { provisionOrganization } from "../services/organizationProvisioningService.js";

export const createOrganization = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      res.status(400).json({
        success: false,
        message: "Organization name is required",
      });
      return;
    }

    const organization = await provisionOrganization({ name });

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: organization,
    });
  } catch (error) {
    console.error("Organization creation error:", error);

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create organization",
    });
  }
};
