import { Router } from "express";
import { MasterController } from "../../controllers/admin/master.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

router.use(authenticate);

// Hospital Routes
router.post("/hospitals", authorize("admin"), MasterController.handleCreateHospital);
router.get("/hospitals", authorize("admin"), MasterController.handleGetAllHospitals);
router.get("/hospitals/:id", authorize("admin"), MasterController.handleGetHospitalById);
router.put("/hospitals/:id", authorize("admin"), MasterController.handleUpdateHospital);
router.delete("/hospitals/:id", authorize("admin"), MasterController.handleDeleteHospital);
router.patch("/hospitals/:id/restore", authorize("admin"), MasterController.handleRestoreHospital);

// Stase Routes
router.post("/stases", authorize("admin"), MasterController.handleCreateStase);
router.get("/stases", authorize("admin"), MasterController.handleGetAllStases);
router.get("/stases/:id", authorize("admin"), MasterController.handleGetStaseById);
router.put("/stases/:id", authorize("admin"), MasterController.handleUpdateStase);
router.delete("/stases/:id", authorize("admin"), MasterController.handleDeleteStase);
router.patch("/stases/:id/restore", authorize("admin"), MasterController.handleRestoreStase);

export default router;
