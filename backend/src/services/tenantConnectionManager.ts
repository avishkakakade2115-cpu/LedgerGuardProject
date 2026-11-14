
import mongoose, { Connection } from "mongoose";
import Tenant from "../models/Tenant.js";
import Organization from "../models/Organization.js";

// Stores active connections and in-progress connection attempts.
// Key = Organization ID
// Value = Promise resolving to a MongoDB connection
const tenantConnections = new Map<string, Promise<Connection>>();

/**
 * Creates a new database connection for an organization.
 */
const createTenantConnection = async (
  organizationId: string
): Promise<Connection> => {
  // Find the tenant configuration in the central database.
  const tenant = await Tenant.findOne({
    organizationId,
    connectionStatus: "active",
  });

  if (!tenant) {
    throw new Error("Active tenant configuration not found");
  }

  // Verify that the organization itself is active.
  const organization = await Organization.findById(organizationId);

  if (!organization || organization.status !== "active") {
    throw new Error("Organization is inactive or does not exist");
  }

  const mongoURI = process.env.CENTRAL_DB_URI;

  if (!mongoURI) {
    throw new Error("CENTRAL_DB_URI is missing");
  }

  console.log(`Creating database connection for: ${organization.slug}`);

  // Connect to the tenant's logical database.
  const connection = await mongoose
    .createConnection(mongoURI, {
      dbName: tenant.databaseName,
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10000,
    })
    .asPromise();

  console.log(
    `Tenant database connected: ${tenant.databaseName}`
  );

  return connection;
};

/**
 * Gets an existing tenant connection or creates a new one.
 */
export const getTenantConnection = async (
  organizationId: string
): Promise<Connection> => {
  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    throw new Error("Invalid organization ID");
  }

  // Check whether a connection already exists or is being created.
  const cachedConnection = tenantConnections.get(organizationId);

  if (cachedConnection) {
    try {
      const connection = await cachedConnection;

      // Reuse only a connection that is currently connected.
      if (connection.readyState === 1) {
        console.log(`Reusing tenant connection: ${organizationId}`);
        return connection;
      }

      tenantConnections.delete(organizationId);
    } catch {
      // Remove a failed connection attempt from the cache.
      tenantConnections.delete(organizationId);
    }
  }

  // Start a new connection attempt.
  const connectionPromise = createTenantConnection(organizationId);

  // Cache the promise immediately to prevent duplicate connections
  // when multiple requests arrive simultaneously.
  tenantConnections.set(organizationId, connectionPromise);

  try {
    return await connectionPromise;
  } catch (error) {
    // Do not leave failed connection attempts in the cache.
    if (tenantConnections.get(organizationId) === connectionPromise) {
      tenantConnections.delete(organizationId);
    }

    throw error;
  }
};

/**
 * Closes a particular tenant connection.
 */
export const closeTenantConnection = async (
  organizationId: string
): Promise<void> => {
  const cachedConnection = tenantConnections.get(organizationId);

  if (!cachedConnection) {
    return;
  }

  tenantConnections.delete(organizationId);

  try {
    const connection = await cachedConnection;
    await connection.close();

    console.log(`Tenant connection closed: ${organizationId}`);
  } catch (error) {
    console.error("Error closing tenant connection:", error);
  }
};

/**
 * Closes all tenant connections.
 * Useful when shutting down the backend server.
 */
export const closeAllTenantConnections = async (): Promise<void> => {
  const organizationIds = Array.from(tenantConnections.keys());

  await Promise.all(
    organizationIds.map((id) => closeTenantConnection(id))
  );

  console.log("All tenant connections closed");
};
