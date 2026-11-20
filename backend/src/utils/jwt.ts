
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
}


export const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

  const options: jwt.SignOptions = {
    expiresIn: expiresIn as NonNullable<jwt.SignOptions["expiresIn"]>,
  };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (
  token: string
): JwtPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const decoded = jwt.verify(token, secret);

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
