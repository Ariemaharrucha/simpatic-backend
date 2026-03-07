import { Router } from "express";
import { StaseController } from "../../controllers/admin/stase.controller";
import { TemplateController } from "../../controllers/admin/template.controller";

export const staseRoutes = Router();

// STASE CRUD OPERATIONS

// Create new stase (clinical rotation type)
// Requires: name (unique), templateFolder, optional: defaultHospitalId, component flags (hasLogbook, hasPortfolio, etc.)
staseRoutes.post("/", StaseController.handleCreateStase);

// Get all stases with pagination (supports ?page=1&limit=10&search=name&includeDeleted=true)
staseRoutes.get("/", StaseController.handleGetAllStases);

// Get available PDF templates for stases (scans src/resources/template/ folder, excludes stase-default)
staseRoutes.get("/templates", TemplateController.handleGetTemplates);

// Get single stase by ID
staseRoutes.get("/:id", StaseController.handleGetStaseById);

// Update stase details (name, templateFolder, defaultHospitalId, component flags)
staseRoutes.put("/:id", StaseController.handleUpdateStase);

// Soft delete stase (mark as deleted, can be restored)
staseRoutes.delete("/:id", StaseController.handleDeleteStase);

// Restore soft-deleted stase
staseRoutes.patch("/:id/restore", StaseController.handleRestoreStase)