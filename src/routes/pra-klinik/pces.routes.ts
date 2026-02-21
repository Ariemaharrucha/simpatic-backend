import { Router } from "express";
import { PcesController } from "../../controllers/pra-klinik/pces.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

// ADMIN ROUTES - Template Management
// Create template
router.post("/admin/templates", authenticate, authorize("admin"), PcesController.handleCreateTemplate);
// Get all templates (optional query: ?courseId=X)
router.get("/admin/templates", authenticate, authorize("admin"), PcesController.handleGetAllTemplates);
// Get template detail
router.get("/admin/templates/:id", authenticate, authorize("admin"), PcesController.handleGetTemplateDetail);

// LECTURER ROUTES - PCES Test
// Get courses that lecturer is assigned to
router.get("/lecturer/courses", authenticate, authorize("lecturer"), PcesController.handleGetLecturerCourses);
// Get templates by course (optional query: ?courseId=X)
router.get("/lecturer/templates", authenticate, authorize("lecturer"), PcesController.handleGetLecturerTemplates);
// Get template detail (to get sopItemIds for creating test)
router.get("/lecturer/templates/:id", authenticate, authorize("lecturer"), PcesController.handleGetTemplateDetail);
// Get classes that have quizzes in a course (query: ?courseId=X)
router.get("/lecturer/classes", authenticate, authorize("lecturer"), PcesController.handleGetLecturerClasses);
// Get students in a class (query: ?classId=X)
router.get("/lecturer/students", authenticate, authorize("lecturer"), PcesController.handleGetLecturerStudents);
// Create PCES test
router.post("/lecturer/tests", authenticate, authorize("lecturer"), PcesController.handleCreatePcesTest);
// Get lecturer's tests history
router.get("/lecturer/tests", authenticate, authorize("lecturer"), PcesController.handleGetLecturerTests);
// Update PCES test (for retake)
router.put("/lecturer/tests/:id", authenticate, authorize("lecturer"), PcesController.handleUpdatePcesTest);
// Get test detail
router.get("/lecturer/tests/:id", authenticate, authorize("lecturer"), PcesController.handleGetTestDetail);

// STUDENT ROUTES
// Get student's own PCES results
router.get("/student/my-results", authenticate, authorize("student"), PcesController.handleGetMyResults);

export default router;