import mongoose from "mongoose";
import { env } from "./env.js";

export const connectCentralDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.CENTRAL_DB_URI);

    console.log("Central MongoDB connected successfully");
    console.log("Database:", mongoose.connection.name);
  } catch (error) {
    console.error("Central MongoDB connection failed:", error);
    process.exit(1);
  }
};