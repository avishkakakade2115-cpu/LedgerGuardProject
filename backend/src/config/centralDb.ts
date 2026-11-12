
import mongoose from "mongoose";

export const connectCentralDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.CENTRAL_DB_URI;

    if (!mongoURI) {
      throw new Error("CENTRAL_DB_URI is missing in environment variables");
    }

    await mongoose.connect(mongoURI);

    console.log("Central MongoDB connected successfully");
    console.log("Database:", mongoose.connection.name);
  } catch (error) {
    console.error("Central MongoDB connection failed:", error);
    process.exit(1);
  }
};
