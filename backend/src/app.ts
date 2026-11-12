
import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

// Security middleware
app.use(helmet());

// Allow frontend communication
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Health check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LedgerGuard API is running successfully",
    timestamp: new Date().toISOString(),
  });
});

export default app;
