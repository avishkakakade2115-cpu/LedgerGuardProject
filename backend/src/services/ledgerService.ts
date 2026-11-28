
import {
  getTenantTransactionModel,
} from "./tenantModelRegistry.js";

import {
  acquireLock,
  releaseLock,
  type DistributedLock,
} from "../utils/distributedLock.js";

import type { TransactionType } from "../models/Transaction.js";

export interface LedgerRequest {
  organizationId: string;
  eventId: string;
  amountPaise: number;
  type: TransactionType;
}

export interface LedgerPreparationResult {
  isDuplicate: boolean;
  lock: DistributedLock | null;
}

/**
 * Validates a ledger request, acquires a Redis lock,
 * and checks whether the event has already been processed.
 *
 * Transaction creation and balance updates are handled separately.
 */
export const prepareLedgerRequest = async (
  request: LedgerRequest
): Promise<LedgerPreparationResult> => {
  const { organizationId, eventId, amountPaise } = request;

  if (!organizationId.trim()) {
    throw new Error("Organization ID is required");
  }

  if (!eventId.trim()) {
    throw new Error("Event ID is required");
  }

  if (
    !Number.isSafeInteger(amountPaise) ||
    amountPaise <= 0
  ) {
    throw new Error(
      "Transaction amount must be a positive integer in paise"
    );
  }

  const lock = await acquireLock(
    `ledger:${organizationId}:${eventId}`
  );

  if (!lock) {
    throw new Error(
      "Another process is already handling this event"
    );
  }

  try {
    const TransactionModel =
      await getTenantTransactionModel(organizationId);

    const existingTransaction =
      await TransactionModel.findOne({ eventId })
        .select("_id eventId status")
        .lean();

    if (existingTransaction) {
      await releaseLock(lock);

      return {
        isDuplicate: true,
        lock: null,
      };
    }

    return {
      isDuplicate: false,
      lock,
    };
  } catch (error) {
    await releaseLock(lock);
    throw error;
  }
};
