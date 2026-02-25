import { Router } from "express";
import { MasterController } from "../../controllers/admin/master.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.post("/hospitals", MasterController.handleCreateHospital);
router.get("/hospitals", MasterController.handleGetAllHospitals);
router.get("/hospitals/:id", MasterController.handleGetHospitalById);
router.put("/hospitals/:id", MasterController.handleUpdateHospital);
router.delete("/hospitals/:id", MasterController.handleDeleteHospital);
router.patch("/hospitals/:id/restore", MasterController.handleRestoreHospital);

export default router;
