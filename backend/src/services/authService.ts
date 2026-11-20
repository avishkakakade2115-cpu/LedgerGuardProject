
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Tenant from "../models/Tenant.js";

import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

interface LoginUserInput {
  email: string;
  password: string;
}

interface LoginUserResult {
  accessToken: string;
  user: {
    userId: string;
    name: string;
    email: string;
    organizationId: string;
    role: "owner" | "admin" | "member";
  };
}


interface LoginUserInput {
  email: string;
  password: string;
}

interface LoginUserResult {
  accessToken: string;
  user: {
    userId: string;
    name: string;
    email: string;
    organizationId: string;
    role: "owner" | "admin" | "member";
  };
}

export const loginUser = async (
  input: LoginUserInput
): Promise<LoginUserResult> => {
  // 1. Validate input
  if (
    typeof input.email !== "string" ||
    typeof input.password !== "string" ||
    !input.email.trim() ||
    !input.password
  ) {
    throw new AuthServiceError(
      "Email and password are required",
      400
    );
  }

  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AuthServiceError("Invalid email format", 400);
  }

  // 2. Find user
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !user.isActive) {
    throw new AuthServiceError(
      "Invalid email or password",
      401
    );
  }

  // 3. Verify password
  const isPasswordValid = await comparePassword(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new AuthServiceError(
      "Invalid email or password",
      401
    );
  }

  // 4. Verify organization
  const organization = await Organization.findById(
    user.organizationId
  );

  if (!organization || organization.status !== "active") {
    throw new AuthServiceError(
      "Organization is inactive or unavailable",
      403
    );
  }

  // 5. Verify tenant configuration
  const tenant = await Tenant.findOne({
    organizationId: user.organizationId,
    connectionStatus: "active",
  });

  if (!tenant) {
    throw new AuthServiceError(
      "Tenant configuration is unavailable",
      503
    );
  }

  // 6. Generate JWT
  const accessToken = generateToken({
    userId: user._id.toString(),
    organizationId: user.organizationId.toString(),
    role: user.role,
  });

  // 7. Return safe user information
  return {
    accessToken,
    user: {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      organizationId: user.organizationId.toString(),
      role: user.role,
    },
  };
};
