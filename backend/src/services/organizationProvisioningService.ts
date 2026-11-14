import type { Collection } from "mongodb";
import mongoose, { Types } from "mongoose";
import Organization from "../models/Organization.js";
import Tenant from "../models/Tenant.js";

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
}

interface ProvisionOrganizationResult {
  organizationId: string;
  organizationName: string;
  slug: string;
  databaseName: string;
  status: "active";
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

  if (name.length < 2 || name.length > 100) {
    throw new Error("Organization name must be between 2 and 100 characters");
  }

  const slug = generateSlug(name);

  if (!slug) {
    throw new Error("Organization name must contain letters or numbers");
  }

  // Example: tenant_acme_technologies
  const databaseName = `tenant_${slug.replace(/-/g, "_")}`;

  const session = await mongoose.startSession();

  let organizationId: Types.ObjectId | undefined;

  try {
    // Create the organization and tenant records atomically.
    await session.withTransaction(async () => {
      const [organization] = await Organization.create(
        [{ name, slug, status: "active" }],
        { session }
      );

      if (!organization) {
        throw new Error("Failed to create organization");
      }

      organizationId = organization._id;

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
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }

  if (!organizationId) {
    throw new Error("Organization creation failed");
  }

  // The central records are now committed.
  // Next, initialize the actual tenant database.
  try {
    const connection = await getTenantConnection(
      organizationId.toString()
    );

    // Insert a metadata document to initialize the tenant database.
    // MongoDB creates the database and collection on this first write.
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
    };
  } catch (error) {
    // Keep incomplete provisioning out of service.
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
