
import mongoose from "mongoose";

import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Tenant from "../models/Tenant.js";


import { hashPassword } from "../utils/password.js";

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  organizationId: string;
}

interface RegisterUserResult {
  userId: string;
  name: string;
  email: string;
  organizationId: string;
  role: "member";
}

export const registerUser = async (
  input: RegisterUserInput
): Promise<RegisterUserResult> => {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const organizationId = input.organizationId;

  // 1. Validate user input
  if (name.length < 2 || name.length > 100) {
    throw new Error("Name must be between 2 and 100 characters");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please provide a valid email address");
  }

  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must contain at least 8 characters");
  }

  if (password.length > 72) {
    throw new Error("Password cannot exceed 72 characters");
  }

  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    throw new Error("Invalid organization ID");
  }

  // 2. Verify organization
  const organization = await Organization.findById(organizationId);

  if (!organization || organization.status !== "active") {
    throw new Error("Organization does not exist or is inactive");
  }

  // 3. Verify tenant configuration
  const tenant = await Tenant.findOne({
    organizationId: organization._id,
    connectionStatus: "active",
  });

  if (!tenant) {
    throw new Error("Active tenant configuration not found");
  }

  // 4. Check whether email is already registered
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  // 5. Hash password
  const passwordHash = await hashPassword(password);

  // 6. Create user in central database
  const user = await User.create({
    name,
    email,
    passwordHash,
    organizationId: organization._id,
    role: "member",
    isActive: true,
  });

  return {
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    organizationId: user.organizationId.toString(),
    role: "member",
  };
};


