import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/login", AuthController.handleLogin);
router.post("/forgot-password", AuthController.handleRequestOTP);
router.post("/verify-otp", AuthController.handleVerifyOTP);
router.post("/reset-password", AuthController.handleResetPassword);

// Protected routes
router.post("/logout", authenticate, AuthController.handleLogout);
router.post("/change-password", authenticate, AuthController.handleChangePassword);
router.get("/me", authenticate, AuthController.handleGetMe);

export default router;
