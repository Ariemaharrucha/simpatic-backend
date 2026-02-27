import { Request, Response, NextFunction } from "express";
import { JwtUtils } from "../utils/jwt.utils";
import { IJWTPayload } from "../types/auth.types";

export interface AuthRequest extends Request {
  user?: IJWTPayload;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        data: null,
      });
    }

    const decoded = JwtUtils.verifyToken(token);

    (req as AuthRequest).user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      data: null,
    });
  }
};
