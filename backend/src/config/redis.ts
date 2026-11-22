

import { createClient } from "redis";
import { env } from "./env.js";

export const redisClient = createClient({
  url: env.REDIS_URL || "redis://127.0.0.1:6380",
});

redisClient.on("error", (error: Error) => {
  console.error("Redis connection error:", error.message);
});

redisClient.on("connect", () => {
  console.log("Connecting to Redis...");
});

redisClient.on("ready", () => {
  console.log("Redis connection established successfully");
});

redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

export const connectRedis = async (): Promise<void> => {
  if (!env.REDIS_URL && env.NODE_ENV !== "production") {
    console.log("Redis skipped in development: REDIS_URL not configured");
    return;
  }

  if (redisClient.isOpen) return;

  await redisClient.connect();

  const pingResponse = await redisClient.ping();

  if (pingResponse !== "PONG") {
    throw new Error("Redis health check failed");
  }

  console.log("Redis health check successful:", pingResponse);
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    await redisClient.quit();
    console.log("Redis disconnected successfully");
  }
};
