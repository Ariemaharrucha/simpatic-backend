import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/login", AuthController.handleLogin);

// Protected routes
router.post("/logout", authenticate, AuthController.handleLogout);
router.post("/change-password", authenticate, AuthController.handleChangePassword);
router.get("/me", authenticate, AuthController.handleGetMe);

export default router;
