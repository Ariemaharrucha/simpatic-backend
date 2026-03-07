import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

export const adminRoutes = Router();

// Apply authentication and admin authorization to all routes
adminRoutes.use(authenticate);
adminRoutes.use(authorize("admin"));

// STUDENT MANAGEMENT

// Register new student (generates user account, sends credentials via email)
adminRoutes.post("/users/students", AdminController.handleRegisterStudent);

// Get all students with pagination (supports ?page=1&limit=10)
adminRoutes.get("/users/students", AdminController.getAllStudents);

// LECTURER MANAGEMENT

// Register new lecturer (generates user account with NIK/lecturerCode, sends credentials via email)
adminRoutes.post("/users/lecturers", AdminController.handleRegisterLecturer);

// Get all lecturers with pagination (supports ?page=1&limit=10)
adminRoutes.get("/users/lecturers", AdminController.getAllLecturers);

// ADMIN MANAGEMENT

// Register new admin (generates user account, sends credentials via email)
adminRoutes.post("/users/admins", AdminController.handleRegisterAdmin);

// Get all admins with pagination (supports ?page=1&limit=10)
adminRoutes.get("/users/admins", AdminController.getAllAdmins);

// CREDENTIALS MANAGEMENT

// Resend login credentials (generates new password and sends via email)
adminRoutes.post("/users/:userId/resend-credentials", AdminController.handleResendCredentials);