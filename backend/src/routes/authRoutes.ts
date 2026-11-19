
import { Router } from "express";

import {
  login,
  getMe,
} from "../controllers/authController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

const router = Router();


// Login
router.post("/login", login);

// Get authenticated user's profile
router.get("/me", authenticateUser, getMe);

export default router;
