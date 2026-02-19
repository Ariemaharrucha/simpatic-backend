import { Router } from "express";
import { PcesController } from "../../controllers/pra-klinik/pces.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

// Admin routes (Template management)
router.post("/templates", authenticate, authorize("admin"), PcesController.handleCreateTemplate);

// Admin & Lecturer routes
router.get("/templates", authenticate, authorize("admin", "lecturer"), PcesController.handleGetAllTemplates);

router.get("/templates/:id", authenticate, authorize("admin", "lecturer"), PcesController.handleGetTemplateDetail);

// Lecturer routes
router.post("/tests", authenticate, authorize("lecturer"), PcesController.handleCreatePcesTest);

router.get("/tests", authenticate, authorize("lecturer"), PcesController.handleGetLecturerTests);

router.get("/tests/:id", authenticate, authorize("lecturer"), PcesController.handleGetTestDetail);

// Student routes
router.get("/my-results", authenticate, authorize("student"), PcesController.handleGetMyResults);

export default router;
