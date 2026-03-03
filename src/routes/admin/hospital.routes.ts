import { Router } from "express";
import { HospitalController } from "../../controllers/admin/hospital.controller";

const router = Router();

router.post("/", HospitalController.handleCreateHospital);
router.get("/", HospitalController.handleGetAllHospitals);
router.get("/:id", HospitalController.handleGetHospitalById);
router.put("/:id", HospitalController.handleUpdateHospital);
router.delete("/:id", HospitalController.handleDeleteHospital);
router.patch("/:id/restore", HospitalController.handleRestoreHospital);

export default router;
