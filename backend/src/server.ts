
import "dotenv/config";
import app from "./app.js";
import { connectCentralDB } from "./config/centralDb.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    // Connect to central MongoDB first
    await connectCentralDB();

    // Start Express server only after DB connection
    app.listen(PORT, () => {
      console.log(`LedgerGuard server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
