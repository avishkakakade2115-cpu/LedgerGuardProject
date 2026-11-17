
import { Router } from "express";

import {
  register,
  login,
  getMe,
} from "../controllers/authController.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

const router = Router();

// Registration
router.post("/register", register);

// Login
router.post("/login", login);

// Get authenticated user's profile
router.get("/me", authenticateUser, getMe);

export default router;
