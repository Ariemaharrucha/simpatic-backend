import { Router } from "express";
import { PraKlinikController } from "../../controllers/admin/pra-klinik.controller";

const router = Router();

router.get("/classes/:id/pra-klinik-status", PraKlinikController.handleGetClassPraKlinikStatus);
router.get("/students/:studentId/pra-klinik-status", PraKlinikController.handleGetStudentPraKlinikStatus);

export default router;