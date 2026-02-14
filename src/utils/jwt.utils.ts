import jwt from "jsonwebtoken";
import { IJWTPayload } from "../types/auth.types";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET_KEY!;

export const JwtUtils = {
  // Generate JWT Token (7 days expiry)
  generateToken: (payload: IJWTPayload): string => {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "7d" });
  },

  // Verify JWT Token
  verifyToken: (token: string): IJWTPayload => {
    return jwt.verify(token, ACCESS_SECRET) as IJWTPayload;
  },
};
