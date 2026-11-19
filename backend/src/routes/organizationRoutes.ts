import { Router } from "express";
import { createOrganization } from "../controllers/organizationController.js";

const router = Router();

// Register a new organization and its first owner
router.post("/register", createOrganization);

export default router;