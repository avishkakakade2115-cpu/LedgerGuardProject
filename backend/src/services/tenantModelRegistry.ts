
import { Connection, Model, Schema } from "mongoose";
import { getTenantConnection } from "./tenantConnectionManager.js";

/**
 * Returns an existing tenant model or registers a new one.
 *
 * Every model is registered on the tenant's own connection,
 * never on the central MongoDB connection.
 */
export const getTenantModel = async <T>(
  organizationId: string,
  modelName: string,
  schema: Schema<T>
): Promise<Model<T>> => {
  const connection: Connection =
    await getTenantConnection(organizationId);

  // Check whether this model is already registered.
  const existingModel = connection.models[modelName] as
    | Model<T>
    | undefined;

  if (existingModel) {
    return existingModel;
  }

  // Register the model on this tenant's connection.
  return connection.model<T>(modelName, schema);
};
