import type { Collection } from "mongodb";
import mongoose, { Types } from "mongoose";
import Organization from "../models/Organization.js";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import { hashPassword } from "../utils/password.js";


interface TenantMetadata {
  _id: string;
  organizationId: Types.ObjectId;
  organizationName: string;
  createdAt: Date;
} 

import {
  getTenantConnection,
  closeTenantConnection,
} from "./tenantConnectionManager.js";

interface ProvisionOrganizationInput {
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

interface ProvisionOrganizationResult {
  organizationId: string;
  organizationName: string;
  slug: string;
  databaseName: string;
  status: "active";
  owner: {
    userId: string;
    name: string;
    email: string;
    role: "owner";
  };
}

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
 * Creates an organization and provisions its tenant database.
 */

export const provisionOrganization = async (
  input: ProvisionOrganizationInput
): Promise<ProvisionOrganizationResult> => {
  const name = input.name.trim();
  const ownerName = input.ownerName.trim();
  const ownerEmail = input.ownerEmail.trim().toLowerCase();
  const ownerPassword = input.ownerPassword;

  // Validate organization
  if (name.length < 2 || name.length > 100) {
    throw new Error("Organization name must be between 2 and 100 characters");
  }

  // Validate owner
  if (ownerName.length < 2 || ownerName.length > 100) {
    throw new Error("Owner name must be between 2 and 100 characters");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
    throw new Error("Please provide a valid owner email address");
  }

  if (typeof ownerPassword !== "string" || ownerPassword.length < 8) {
    throw new Error("Password must contain at least 8 characters");
  }

  if (Buffer.byteLength(ownerPassword, "utf8") > 72) {
    throw new Error("Password exceeds the maximum supported length");
  }

  const slug = generateSlug(name);

  if (!slug) {
    throw new Error("Organization name must contain letters or numbers");
  }

  const databaseName = `tenant_${slug.replace(/-/g, "_")}`;

  // Hash before opening the transaction
  const passwordHash = await hashPassword(ownerPassword);

  const session = await mongoose.startSession();

  let organizationId: Types.ObjectId | undefined;
  let ownerId: Types.ObjectId | undefined;

  try {
    await session.withTransaction(async () => {
      // Check globally unique email
      const existingUser = await User.findOne({
        email: ownerEmail,
      }).session(session);

      if (existingUser) {
        throw new Error("Email is already registered");
      }

      const [organization] = await Organization.create(
        [{ name, slug, status: "active" }],
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
  } finally {
    await session.endSession();
  }

  if (!organizationId || !ownerId) {
    throw new Error("Organization provisioning failed");
  }

  // Initialize the tenant database after central records are committed
  try {
    const connection = await getTenantConnection(
      organizationId.toString()
    );

    const metadataCollection = connection.collection<TenantMetadata>(
      "tenant_metadata"
    );

    await metadataCollection.updateOne(
      { _id: "tenant_info" },
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
      owner: {
        userId: ownerId.toString(),
        name: ownerName,
        email: ownerEmail,
        role: "owner",
      },
    };
  } catch (error) {
    await closeTenantConnection(organizationId.toString());

    await Tenant.updateOne(
      { organizationId },
      { $set: { connectionStatus: "inactive" } }
    );

    await Organization.updateOne(
      { _id: organizationId },
      { $set: { status: "suspended" } }
    );

    throw new Error(
      "Organization was registered, but tenant database initialization failed. The organization has been suspended."
    );
  }
};
