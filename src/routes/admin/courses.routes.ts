import { Router } from "express";
import { CourseController } from "../../controllers/admin/course.controller";

const router = Router();

// CRUD Routes
router.post("/", CourseController.handleCreateCourse);
router.get("/", CourseController.handleGetAllCourses);
router.get("/:id", CourseController.handleGetCourseById);
router.put("/:id", CourseController.handleUpdateCourse);
router.delete("/:id", CourseController.handleDeleteCourse);
router.patch("/:id/restore", CourseController.handleRestoreCourse);

// Lecturer plotting routes
router.get("/:id/lecturers", CourseController.handleGetLecturers);
router.get("/:id/available-lecturers", CourseController.handleGetAvailableLecturers);
router.post("/:id/lecturers", CourseController.handleAssignLecturer);
router.delete("/:id/lecturers/:lecturerId", CourseController.handleRemoveLecturer);

export default router;
