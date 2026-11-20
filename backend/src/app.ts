
import express from "express";
import cors from "cors";
import helmet from "helmet";

import organizationRoutes from "./routes/organizationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import tenantTestRoutes from "./routes/tenantTestRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { env } from "./config/env.js";

const app = express();

// Security middleware
app.use(helmet());

// Allow frontend communication
const allowedOrigins = env.CORS_ORIGIN.split(",").map(
  (origin) => origin.trim()
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);

// Parse incoming JSON requests
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/dashboard", dashboardRoutes);

if (env.NODE_ENV !== "production") {
  app.use("/api/tenant-test", tenantTestRoutes);
}

// Health check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LedgerGuard API is running successfully",
    timestamp: new Date().toISOString(),
  });
});

export default app;
