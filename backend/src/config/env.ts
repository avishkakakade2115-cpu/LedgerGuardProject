
import "dotenv/config";

const requiredEnvVariables = [
  "CENTRAL_DB_URI",
  "JWT_SECRET",
] as const;

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `Missing required environment variable: ${variable}`
    );
  }
}

const NODE_ENV = process.env.NODE_ENV || "development";

if (NODE_ENV === "production" && !process.env.REDIS_URL) {
  throw new Error("Missing required environment variable: REDIS_URL");
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV,
  CENTRAL_DB_URI: process.env.CENTRAL_DB_URI!,
  REDIS_URL: process.env.REDIS_URL || "",
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};
