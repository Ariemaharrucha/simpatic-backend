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
  // Login untuk semua user (admin, lecturer, student)
  // Admin: email, Lecturer: NIK, Student: NIM
  handleLogin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier, email, password } = req.body;

      // Support both 'identifier' and 'email' for backward compatibility
      const loginIdentifier = identifier || email;

      if (!loginIdentifier || !password) {
        return ResponseUtils.error(
          res,
          "Identifier and password are required",
          400,
        );
      }

      const result = await AuthService.login(loginIdentifier, password);

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
  handleChangePassword: async ( req: AuthRequest, res: Response, next: NextFunction ) => {
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

  // Request OTP for password reset
  handleRequestOTP: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      if (!email) {
        return ResponseUtils.error(res, "Email is required", 400);
      }

      await AuthService.requestOTP(email);
      return ResponseUtils.success(
        res,
        null,
        "OTP code has been sent to your email",
      );
    } catch (error) {
      next(error);
    }
  },

  // Verify OTP
  handleVerifyOTP: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return ResponseUtils.error(res, "Email and OTP are required", 400);
      }

      const result = await AuthService.verifyOTP(email, otp);
      return ResponseUtils.success(
        res,
        { resetToken: result.resetToken },
        "OTP verified successfully",
      );
    } catch (error) {
      next(error);
    }
  },

  // Reset password
  handleResetPassword: async ( req: Request, res: Response, next: NextFunction ) => {
    try {
      const { email, resetToken, newPassword } = req.body;

      if (!email || !resetToken || !newPassword) {
        return ResponseUtils.error(
          res,
          "Email, reset token, and new password are required",
          400,
        );
      }

      await AuthService.resetPassword(email, resetToken, newPassword);
      return ResponseUtils.success(res, null, "Password reset successfully");
    } catch (error) {
      next(error);
    }
  },
};
