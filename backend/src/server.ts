import app from "./app.js";
import { connectCentralDB } from "./config/centralDb.js";
import { env } from "./config/env.js";

const startServer = async (): Promise<void> => {
  try {
    await connectCentralDB();

    app.listen(env.PORT, () => {
      console.log(`LedgerGuard server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();