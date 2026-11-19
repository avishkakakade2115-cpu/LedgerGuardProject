
import { Router } from "express";

import { authenticateUser } from "../middleware/authMiddleware.js";
import { getDashboardOverview } from "../controllers/dashboardController.js";

const router = Router();

// Get dashboard overview for the authenticated organization
router.get(
  "/overview",
  authenticateUser,
  getDashboardOverview
);

export default router;
