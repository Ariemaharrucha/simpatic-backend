import { Router } from "express";
import { PcesController } from "../../controllers/pra-klinik/pces.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

export const pcesRoutes = Router();

// ADMIN ROUTES - Template Management

// Create template
pcesRoutes.post("/admin/templates", authenticate, authorize("admin"), PcesController.handleCreateTemplate);

// Get all templates (optional query: ?courseId=X)
pcesRoutes.get("/admin/templates", authenticate, authorize("admin"), PcesController.handleGetAllTemplates);

// Get template detail
pcesRoutes.get("/admin/templates/:id", authenticate, authorize("admin"), PcesController.handleGetTemplateDetail);

// LECTURER ROUTES - PCES Test

// Get courses that lecturer is assigned to
pcesRoutes.get("/lecturer/courses", authenticate, authorize("lecturer"), PcesController.handleGetLecturerCourses);

// Get templates by course (optional query: ?courseId=X)
pcesRoutes.get("/lecturer/templates", authenticate, authorize("lecturer"), PcesController.handleGetLecturerTemplates);

// Get template detail (to get sopItemIds for creating test)
pcesRoutes.get("/lecturer/templates/:id", authenticate, authorize("lecturer"), PcesController.handleGetTemplateDetail);

// Get classes that have quizzes in a course (query: ?courseId=X)
pcesRoutes.get("/lecturer/classes", authenticate, authorize("lecturer"), PcesController.handleGetLecturerClasses);

// Get students in a class (query: ?classId=X)
pcesRoutes.get("/lecturer/students", authenticate, authorize("lecturer"), PcesController.handleGetLecturerStudents);

// Create PCES test
pcesRoutes.post("/lecturer/tests", authenticate, authorize("lecturer"), PcesController.handleCreatePcesTest);

// Get lecturer's tests history
pcesRoutes.get("/lecturer/tests", authenticate, authorize("lecturer"), PcesController.handleGetLecturerTests);

// Update PCES test (for retake)
pcesRoutes.put("/lecturer/tests/:id", authenticate, authorize("lecturer"), PcesController.handleUpdatePcesTest);

// Get test detail
pcesRoutes.get("/lecturer/tests/:id", authenticate, authorize("lecturer"), PcesController.handleGetTestDetail);

// STUDENT ROUTES

// Get student's own PCES results
pcesRoutes.get("/student/my-results", authenticate, authorize("student"), PcesController.handleGetMyResults);