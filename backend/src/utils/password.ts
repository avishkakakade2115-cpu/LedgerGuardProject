
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Converts a plain password into a secure bcrypt hash.
 */
export const hashPassword = async (
  password: string
): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plain password with its stored bcrypt hash.
 */
export const comparePassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  return bcrypt.compare(password, passwordHash);
};
