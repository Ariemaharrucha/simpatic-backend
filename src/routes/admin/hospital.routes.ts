import { Router } from "express";
import { HospitalController } from "../../controllers/admin/hospital.controller";

export const hospitalRoutes = Router();

// HOSPITAL CRUD OPERATIONS

// Create new hospital (requires name, latitude, longitude; validates unique name and coordinate ranges)
// latitude: -90 to 90, longitude: -180 to 180, radius: min 50 meters
hospitalRoutes.post("/", HospitalController.handleCreateHospital);

// Get all hospitals with pagination (supports ?page=1&limit=10&search=name&includeDeleted=true)
hospitalRoutes.get("/", HospitalController.handleGetAllHospitals);

// Get single hospital by ID
hospitalRoutes.get("/:id", HospitalController.handleGetHospitalById);

// Update hospital details (name, latitude, longitude, radius)
hospitalRoutes.put("/:id", HospitalController.handleUpdateHospital);

// Soft delete hospital (mark as deleted, can be restored)
hospitalRoutes.delete("/:id", HospitalController.handleDeleteHospital);

// Restore soft-deleted hospital
hospitalRoutes.patch("/:id/restore", HospitalController.handleRestoreHospital);