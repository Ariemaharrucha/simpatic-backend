import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

export const authRoutes = Router();

// PUBLIC ROUTES (No authentication required)

// Login user - Admin: email, Lecturer: NIK (lecturerCode), Student: NIM
authRoutes.post("/login", AuthController.handleLogin);

// Request OTP code for password reset (sends email with 6-digit OTP)
authRoutes.post("/forgot-password", AuthController.handleRequestOTP);

// Verify OTP code and get reset token
authRoutes.post("/verify-otp", AuthController.handleVerifyOTP);

// Reset password using reset token from verified OTP
authRoutes.post("/reset-password", AuthController.handleResetPassword);

// PROTECTED ROUTES (Authentication required)

// Logout user (clears JWT cookie)
authRoutes.post("/logout", authenticate, AuthController.handleLogout);

// Change password (requires current password verification)
authRoutes.post("/change-password", authenticate, AuthController.handleChangePassword);

// Get current logged-in user info
authRoutes.get("/me", authenticate, AuthController.handleGetMe);