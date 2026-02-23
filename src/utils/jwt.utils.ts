import jwt from "jsonwebtoken";
import { IJWTPayload } from "../types/auth.types";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET_KEY!;
const RESET_SECRET = process.env.JWT_ACCESS_SECRET_KEY! + "_reset";

export const JwtUtils = {
  // Generate JWT Token (7 days expiry)
  generateToken: (payload: IJWTPayload): string => {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "7d" });
  },

  // Verify JWT Token
  verifyToken: (token: string): IJWTPayload => {
    return jwt.verify(token, ACCESS_SECRET) as IJWTPayload;
  },

  // Generate Reset Token (10 minutes expiry for password reset)
  generateResetToken: (email: string, userId: number): string => {
    return jwt.sign({ email, userId, type: "password_reset" }, RESET_SECRET, {
      expiresIn: "10m",
    });
  },

  // Verify Reset Token
  verifyResetToken: (
    token: string,
  ): { email: string; userId: number } | null => {
    try {
      const decoded = jwt.verify(token, RESET_SECRET) as {
        email: string;
        userId: number;
        type: string;
      };
      if (decoded.type !== "password_reset") {
        return null;
      }
      return { email: decoded.email, userId: decoded.userId };
    } catch {
      return null;
    }
  },
};
