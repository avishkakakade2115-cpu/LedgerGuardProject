import {
  IAccount,
  accountSchema,
} from "../models/Account.js";
import { Connection, Model, Schema } from "mongoose";
import { getTenantConnection } from "./tenantConnectionManager.js";
import {
  ITransaction,
  transactionSchema,
} from "../models/Transaction.js";

/**
 * Returns an existing tenant model or registers a new one.
 */
export const getTenantModel = async <T>(
  organizationId: string,
  modelName: string,
  schema: Schema<T>
): Promise<Model<T>> => {
  const connection: Connection =
    await getTenantConnection(organizationId);

  const existingModel = connection.models[modelName] as
    | Model<T>
    | undefined;

  if (existingModel) {
    return existingModel;
  }

  return connection.model<T>(modelName, schema);
};

/**
 * Gets or registers the Transaction model
 * on the organization's tenant database.
 */
export const getTenantTransactionModel = async (
  organizationId: string
): Promise<Model<ITransaction>> => {
  return getTenantModel<ITransaction>(
    organizationId,
    "Transaction",
    transactionSchema
  );
};
/**
 * Gets or registers the Account model
 * on the organization's tenant database.
 */
export const getTenantAccountModel = async (
  organizationId: string
): Promise<Model<IAccount>> => {
  return getTenantModel<IAccount>(
    organizationId,
    "Account",
    accountSchema
  );
};
