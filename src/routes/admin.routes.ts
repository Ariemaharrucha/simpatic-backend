import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);
router.use(authorize("admin"));

// Student routes
router.post("/users/students", AdminController.handleRegisterStudent);
router.get("/users/students", AdminController.getAllStudents);

// Lecturer routes
router.post("/users/lecturers", AdminController.handleRegisterLecturer);
router.get("/users/lecturers", AdminController.getAllLecturers);

// Admin routes
router.post("/users/admins", AdminController.handleRegisterAdmin);
router.get("/users/admins", AdminController.getAllAdmins);

// Resend credentials
router.post("/users/:userId/resend-credentials", AdminController.handleResendCredentials);

export default router;
