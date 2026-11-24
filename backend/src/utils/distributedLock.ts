
import { randomUUID } from "node:crypto";
import { redisClient } from "../config/redis.js";

export interface DistributedLock {
  key: string;
  token: string;
}

const DEFAULT_LOCK_TTL = 30_000;

/**
 * Acquires a distributed lock using Redis.
 * Returns the lock details if successful, otherwise null.
 */
export const acquireLock = async (
  key: string,
  ttl: number = DEFAULT_LOCK_TTL
): Promise<DistributedLock | null> => {
  if (!redisClient.isReady) {
    throw new Error("Redis is not connected");
  }

  if (!key.trim()) {
    throw new Error("Lock key cannot be empty");
  }

  if (!Number.isSafeInteger(ttl) || ttl <= 0) {
    throw new Error("Lock TTL must be a positive integer");
  }

  const token = randomUUID();

  const result = await redisClient.set(key, token, {
    NX: true,
    PX: ttl,
  });

  if (result !== "OK") {
    return null;
  }

  return { key, token };
};

/**
 * Releases a lock only if the caller owns it.
 */
export const releaseLock = async (
  lock: DistributedLock
): Promise<boolean> => {
  if (!redisClient.isReady) {
    throw new Error("Redis is not connected");
  }

  const script = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;

  const result = await redisClient.eval(script, {
    keys: [lock.key],
    arguments: [lock.token],
  });

  return result === 1;
};
