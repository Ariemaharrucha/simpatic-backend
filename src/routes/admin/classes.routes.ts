import { Router } from "express";
import { ClassController } from "../../controllers/admin/class.controller";

export const classesRoutes = Router();

// CLASS CRUD OPERATIONS

// Create new class (requires unique name + academicYear combination)
classesRoutes.post("/", ClassController.handleCreateClass);

// Get all classes with pagination (supports ?page=1&limit=10&academicYear=2025/2026&includeInactive=true)
classesRoutes.get("/", ClassController.handleGetAllClasses);

// Get students not assigned to any class (for assignment), filter by academicYear)
classesRoutes.get("/available-students", ClassController.handleGetAvailableStudents);

// Get single class by ID
classesRoutes.get("/:id", ClassController.handleGetClassById);

// Update class details (name, academicYear)
classesRoutes.put("/:id", ClassController.handleUpdateClass);

// Soft delete class (mark as inactive, can be restored)
classesRoutes.delete("/:id", ClassController.handleDeleteClass);

// Restore soft-deleted class
classesRoutes.patch("/:id/restore", ClassController.handleRestoreClass);

// STUDENT PLOTTING (Assign students to class)

// Get all students assigned to a specific class
classesRoutes.get("/:id/students", ClassController.handleGetStudents);

// Assign student to class (validates student exists and not already in class for same year)
classesRoutes.post("/:id/students", ClassController.handleAssignStudent);

// Remove student from class
classesRoutes.delete("/:id/students/:studentId", ClassController.handleRemoveStudent);