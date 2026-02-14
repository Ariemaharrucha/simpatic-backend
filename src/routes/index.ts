import { Router } from "express";
import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";

const router = Router();

// Auth routes (public)
router.use("/auth", authRoutes);

// Admin routes (admin only)
router.use("/admin", adminRoutes);

// TODO: Add other routes here
// router.use("/lecturer", authenticate, authorize("lecturer"), lecturerRoutes);
// router.use("/student", authenticate, authorize("student"), studentRoutes);

export default router;
