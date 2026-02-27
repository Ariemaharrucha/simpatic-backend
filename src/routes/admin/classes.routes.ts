import { Router } from "express";
import { ClassController } from "../../controllers/admin/class.controller";

const router = Router();

// CRUD Routes
router.post("/", ClassController.handleCreateClass);
router.get("/", ClassController.handleGetAllClasses);
router.get("/available-students", ClassController.handleGetAvailableStudents);
router.get("/:id", ClassController.handleGetClassById);
router.put("/:id", ClassController.handleUpdateClass);
router.delete("/:id", ClassController.handleDeleteClass);
router.patch("/:id/restore", ClassController.handleRestoreClass);

// Student plotting routes
router.get("/:id/students", ClassController.handleGetStudents);
router.post("/:id/students", ClassController.handleAssignStudent);
router.delete("/:id/students/:studentId", ClassController.handleRemoveStudent);

export default router;
