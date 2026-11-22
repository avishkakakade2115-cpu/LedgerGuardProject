
import app from "./app.js";
import mongoose from "mongoose";

import { connectCentralDB } from "./config/centralDb.js";
import {
  connectRedis,
  disconnectRedis,
} from "./config/redis.js";

import { redisClient } from "./config/redis.js";
import { env } from "./config/env.js";

import type { Server } from "node:http";



let server: Server | null = null;
let isShuttingDown = false;



const shutdown = async (signal: string): Promise<void> => {
   console.log("Shutdown handler triggered:", signal);

  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      console.log("HTTP server closed");
    }

    await disconnectRedis();

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("Central MongoDB disconnected successfully");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

const startServer = async (): Promise<void> => {
  try {
    await connectCentralDB();
    await connectRedis();

    server = app.listen(env.PORT, () => {
      console.log(`LedgerGuard server running on port ${env.PORT}`);
    });

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error("Server startup failed:", error);

    try {
      if (redisClient.isOpen) {
        await disconnectRedis();
      }

      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    } catch (cleanupError) {
      console.error("Startup cleanup failed:", cleanupError);
    }

    process.exit(1);
  }
};

void startServer();
