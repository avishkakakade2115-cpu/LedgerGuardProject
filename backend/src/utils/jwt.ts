import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface JwtPayload {
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
}

export const generateToken = (payload: JwtPayload): string => {
  const options: jwt.SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as NonNullable<
      jwt.SignOptions["expiresIn"]
    >,
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (
    typeof decoded === "string" ||
    typeof decoded.userId !== "string" ||
    typeof decoded.organizationId !== "string" ||
    !["owner", "admin", "member"].includes(decoded.role as string)
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    userId: decoded.userId,
    organizationId: decoded.organizationId,
    role: decoded.role as JwtPayload["role"],
  };
};