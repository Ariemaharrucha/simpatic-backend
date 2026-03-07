import { Router } from "express";
import { CourseController } from "../../controllers/admin/course.controller";

export const coursesRoutes = Router();

// COURSE CRUD OPERATIONS

// Create new course (requires unique code and name)
coursesRoutes.post("/", CourseController.handleCreateCourse);

// Get all courses with pagination (supports ?page=1&limit=10&includeInactive=true)
coursesRoutes.get("/", CourseController.handleGetAllCourses);

// Get single course by ID
coursesRoutes.get("/:id", CourseController.handleGetCourseById);

// Update course details (code, name)
coursesRoutes.put("/:id", CourseController.handleUpdateCourse);

// Soft delete course (mark as inactive, can be restored)
coursesRoutes.delete("/:id", CourseController.handleDeleteCourse);

// Restore soft-deleted course
coursesRoutes.patch("/:id/restore", CourseController.handleRestoreCourse);

// LECTURER PLOTTING (Assign lecturers to course)

// Get all lecturers assigned to a specific course
coursesRoutes.get("/:id/lecturers", CourseController.handleGetLecturers);

// Get lecturers NOT yet assigned to this course (available for assignment)
coursesRoutes.get("/:id/available-lecturers", CourseController.handleGetAvailableLecturers);

// Assign lecturer to course (validates lecturer exists and not already assigned)
coursesRoutes.post("/:id/lecturers", CourseController.handleAssignLecturer);

// Remove lecturer from course
coursesRoutes.delete("/:id/lecturers/:lecturerId", CourseController.handleRemoveLecturer);