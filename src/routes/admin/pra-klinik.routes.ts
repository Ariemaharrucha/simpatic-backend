import { Router } from "express";
import { PraKlinikController } from "../../controllers/admin/pra-klinik.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

router.get("/classes/:id/pra-klinik-status", authenticate, authorize("admin"), PraKlinikController.handleGetClassPraKlinikStatus);

router.get("/students/:studentId/pra-klinik-status", authenticate, authorize("admin"), PraKlinikController.handleGetStudentPraKlinikStatus);

export default router;