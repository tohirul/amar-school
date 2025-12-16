import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);

/**
 * Hash a plain text password
 * @param password - the plain text password
 * @returns hashed password
 */
export async function hashValue(value: string) {
  return bcrypt.hash(value, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a hashed value
 * @param value - the plain text password
 * @param hashed - the hashed password from DB
 * @returns boolean
 */
export async function verifyHash(value: string, hashed: string) {
  return bcrypt.compare(value, hashed);
}

// Secret keys (store in .env)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

// -----------------------------
// Generate Access Token
// -----------------------------
export function generateAccessToken(user: { id: string; role: string }) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } // short-lived token
  );
}

// -----------------------------
// Generate Refresh Token
// -----------------------------
export function generateRefreshToken(sessionId: number) {
  return jwt.sign({ sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
}

// -----------------------------
// Verify Refresh Token
// -----------------------------
export function verifyRefreshToken(token: string) {
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
      sessionId: number;
    };
    return payload;
  } catch (err) {
    return null;
  }
}
