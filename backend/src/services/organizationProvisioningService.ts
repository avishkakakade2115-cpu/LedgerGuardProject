
import mongoose, { Types } from "mongoose";
import Organization, { CompanySize } from "../models/Organization.js";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import { hashPassword } from "../utils/password.js";
import {
  getTenantConnection,
  closeTenantConnection,
} from "./tenantConnectionManager.js";

interface TenantMetadata {
  _id: string;
  organizationId: Types.ObjectId;
  organizationName: string;
  createdAt: Date;
}

export class ProvisioningError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "ProvisioningError";
  }
}

export interface ProvisionOrganizationInput {
  name: string;
  companyEmail: string;
  companyDomain: string;
  contactNumber: string;
  companySize: CompanySize;
  companyAddress: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

export interface ProvisionOrganizationResult {
  organizationId: string;
  organizationName: string;
  slug: string;
  databaseName: string;
  status: "active";
  companyEmail: string;
  companyDomain: string;
  contactNumber: string;
  companySize: string;
  companyAddress: string;
  owner: {
    userId: string;
    name: string;
    email: string;
    role: "owner";
  };
}

const ALLOWED_COMPANY_SIZES: CompanySize[] = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
];

/**
 * Converts an organization name into a URL-friendly slug.
 */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
};

/**
 * Normalizes a company domain input by removing protocol and path.
 */
const normalizeDomain = (domain: string): string => {
  let cleaned = domain.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, "");
  return cleaned.split(/[\/?#]/)[0] || "";
};

/**
 * Creates an organization and provisions its tenant database.
 */
export const provisionOrganization = async (
  input: ProvisionOrganizationInput
): Promise<ProvisionOrganizationResult> => {
  // 1. Sanitize inputs
  const name = (input.name || "").trim();
  const companyEmail = (input.companyEmail || "").trim().toLowerCase();
  const rawDomain = (input.companyDomain || "").trim();
  const contactNumber = (input.contactNumber || "").trim();
  const companySize = input.companySize;
  const companyAddress = (input.companyAddress || "").trim();
  const ownerName = (input.ownerName || "").trim();
  const ownerEmail = (input.ownerEmail || "").trim().toLowerCase();
  const ownerPassword = input.ownerPassword || "";

  // 2. Validate organization details
  if (!name || name.length < 2 || name.length > 100) {
    throw new ProvisioningError(
      "Organization name must be between 2 and 100 characters",
      400
    );
  }

  if (!companyEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) {
    throw new ProvisioningError(
      "Please provide a valid company email address",
      400
    );
  }

  const normalizedDomain = normalizeDomain(rawDomain);

  if (
  !normalizedDomain ||
    !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(
  normalizedDomain
)
) {
  throw new ProvisioningError(
    "Please provide a valid company domain (e.g. company.com)",
    400
  );
}
  const digitsOnly = contactNumber.replace(/\D/g, "");

  if (
    !contactNumber ||
    digitsOnly.length < 7 ||
    !/^\+?[0-9\s\-()]{7,25}$/.test(contactNumber)
  ) {
    throw new ProvisioningError(
      "Please provide a valid contact phone number with at least 7 digits",
      400
    );
  }

  if (!companySize || !ALLOWED_COMPANY_SIZES.includes(companySize)) {
    throw new ProvisioningError(
      `Company size must be one of: ${ALLOWED_COMPANY_SIZES.join(", ")}`,
      400
    );
  }

  if (!companyAddress || companyAddress.length < 2) {
    throw new ProvisioningError("Company address is required", 400);
  }

  if (companyAddress.length > 300) {
    throw new ProvisioningError(
      "Company address must not exceed 300 characters",
      400
    );
  }

  // 3. Validate owner details
  if (!ownerName || ownerName.length < 2 || ownerName.length > 100) {
    throw new ProvisioningError(
      "Owner name must be between 2 and 100 characters",
      400
    );
  }

  if (!ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
    throw new ProvisioningError(
      "Please provide a valid owner email address",
      400
    );
  }

  if (typeof ownerPassword !== "string" || ownerPassword.length < 8) {
    throw new ProvisioningError(
      "Password must contain at least 8 characters",
      400
    );
  }

  if (Buffer.byteLength(ownerPassword, "utf8") > 72) {
    throw new ProvisioningError(
      "Password exceeds the maximum supported length of 72 bytes",
      400
    );
  }

  const slug = generateSlug(name);

  if (!slug) {
    throw new ProvisioningError(
      "Organization name must contain letters or numbers",
      400
    );
  }

  const databaseName = `tenant_${slug.replace(/-/g, "_")}`;

  // 4. Pre-check uniqueness before heavy operations
  const [existingUserByEmail, existingOrgBySlug] = await Promise.all([
    User.findOne({ email: ownerEmail }),
    Organization.findOne({ slug }),
  ]);

  if (existingUserByEmail) {
    throw new ProvisioningError("Email is already registered", 409);
  }

  if (existingOrgBySlug) {
    throw new ProvisioningError(
      "An organization with this name already exists",
      409
    );
  }

  // Hash password before transaction
  const passwordHash = await hashPassword(ownerPassword);

  const session = await mongoose.startSession();

  let organizationId: Types.ObjectId | undefined;
  let ownerId: Types.ObjectId | undefined;

  try {
    await session.withTransaction(async () => {
      // Re-verify inside transaction
      const existingUser = await User.findOne({
        email: ownerEmail,
      }).session(session);

      if (existingUser) {
        throw new ProvisioningError("Email is already registered", 409);
      }

      const existingOrg = await Organization.findOne({
        slug,
      }).session(session);

      if (existingOrg) {
        throw new ProvisioningError(
          "An organization with this name already exists",
          409
        );
      }

      const [organization] = await Organization.create(
        [
          {
            name,
            slug,
            companyEmail,
            companyDomain: normalizedDomain,
            contactNumber,
            companySize,
            companyAddress,
            status: "active",
          },
        ],
        { session }
      );

      if (!organization) {
        throw new Error("Failed to create organization");
      }

      organizationId = organization._id;

      const [owner] = await User.create(
        [
          {
            name: ownerName,
            email: ownerEmail,
            passwordHash,
            organizationId: organization._id,
            role: "owner",
            isActive: true,
          },
        ],
        { session }
      );

      if (!owner) {
        throw new Error("Failed to create owner account");
      }

      ownerId = owner._id;

      await Tenant.create(
        [
          {
            organizationId: organization._id,
            databaseName,
            connectionStatus: "active",
          },
        ],
        { session }
      );
    });
  } catch (error: any) {
    if (error instanceof ProvisioningError) {
      throw error;
    }

    if (
      error?.code === 11000 ||
      error?.message?.includes("E11000 duplicate key")
    ) {
      throw new ProvisioningError(
        "An organization or user with these details already exists",
        409
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }

  if (!organizationId || !ownerId) {
    throw new ProvisioningError("Organization provisioning failed", 500);
  }

  // 5. Initialize the tenant database metadata
  try {
    const connection = await getTenantConnection(organizationId.toString());

    const metadataCollection =
      connection.collection<TenantMetadata>("tenant_metadata");

    await metadataCollection.updateOne(
      { _id: "tenant_info" as any },
      {
        $setOnInsert: {
          organizationId,
          organizationName: name,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return {
      organizationId: organizationId.toString(),
      organizationName: name,
      slug,
      databaseName,
      status: "active",
      companyEmail,
      companyDomain: normalizedDomain,
      contactNumber,
      companySize,
      companyAddress,
      owner: {
        userId: ownerId.toString(),
        name: ownerName,
        email: ownerEmail,
        role: "owner",
      },
    };
  } catch (error) {
    console.error("Tenant initialization failed:", error);

    await closeTenantConnection(organizationId.toString());

    await Tenant.updateOne(
      { organizationId },
      { $set: { connectionStatus: "inactive" } }
    );

    await Organization.updateOne(
      { _id: organizationId },
      { $set: { status: "suspended" } }
    );

    throw new ProvisioningError(
      "Organization was registered, but tenant database initialization failed. The organization has been suspended.",
      503
    );
  }
};
