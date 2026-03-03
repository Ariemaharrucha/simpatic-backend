import { Router } from "express";
import { StaseController } from "../../controllers/admin/stase.controller";
import { TemplateController } from "../../controllers/admin/template.controller";

const router = Router();

router.post("/", StaseController.handleCreateStase);
router.get("/", StaseController.handleGetAllStases);
router.get("/templates", TemplateController.handleGetTemplates);
router.get("/:id", StaseController.handleGetStaseById);
router.put("/:id", StaseController.handleUpdateStase);
router.delete("/:id", StaseController.handleDeleteStase);
router.patch("/:id/restore", StaseController.handleRestoreStase);

export default router;
