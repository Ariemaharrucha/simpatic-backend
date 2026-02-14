import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { ResponseUtils } from "../utils/response.utils";
import { AuthRequest } from "../middleware/auth.middleware";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const AuthController = {
  // Login untuk semua user (admin, lecturer, student) menggunakan email
  handleLogin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ResponseUtils.error(
          res,
          "Email and password are required",
          400,
        );
      }

      const result = await AuthService.login(email, password);

      res.cookie("token", result.token, COOKIE_OPTIONS);

      return ResponseUtils.success(
        res,
        { user: result.user },
        "Login successful",
      );
    } catch (error) {
      next(error);
    }
  },

  // Logout
  handleLogout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
      });

      return ResponseUtils.success(res, null, "Logout successful");
    } catch (error) {
      next(error);
    }
  },

  // Change password
  handleChangePassword: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.userId;
      const { oldPassword, newPassword } = req.body;

      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      if (!oldPassword || !newPassword) {
        return ResponseUtils.error(
          res,
          "Old password and new password are required",
          400,
        );
      }

      await AuthService.changePassword(userId, oldPassword, newPassword);
      return ResponseUtils.success(res, null, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  },

  // Get current user info
  handleGetMe: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtils.unauthorized(res);
      }

      const user = await AuthService.getUserById(userId);
      return ResponseUtils.success(res, { user }, "User info retrieved");
    } catch (error) {
      next(error);
    }
  },
};
