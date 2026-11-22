import { Request, Response } from "express";
import {
  provisionOrganization,
  ProvisioningError,
} from "../services/organizationProvisioningService.js";

export const createOrganization = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      companyEmail,
      companyDomain,
      contactNumber,
      companySize,
      companyAddress,
      ownerName,
      ownerEmail,
      ownerPassword,
    } = req.body;

    const organization = await provisionOrganization({
      name,
      companyEmail,
      companyDomain,
      contactNumber,
      companySize,
      companyAddress,
      ownerName,
      ownerEmail,
      ownerPassword,
    });

    res.status(201).json({
      success: true,
      message: "Organization and owner account created successfully",
      data: organization,
    });
  } catch (error) {
    console.error("Organization creation error:", error);

    if (error instanceof ProvisioningError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    const message =
      error instanceof Error ? error.message : "Organization registration failed";

    const statusCode =
      message.includes("already registered") || message.includes("already exists")
        ? 409
        : message.includes("required") ||
          message.includes("valid") ||
          message.includes("between") ||
          message.includes("characters") ||
          message.includes("maximum")
        ? 400
        : message.includes("suspended")
        ? 503
        : 500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
