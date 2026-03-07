import { Router } from "express";
import { PraKlinikController } from "../../controllers/admin/pra-klinik.controller";

export const praKlinikRoutes = Router();

// PRA KLINIK STATUS (Pre-Clinical Assessment)

// Get pra-klinik status (Quiz + PCES scores) for all students in a class
// Returns: quizScore, pcesScore, totalScore (Quiz 50% + PCES 50%), preClinicalPassed status
// Updates student.preClinicalPassed = true if totalScore >= 60
praKlinikRoutes.get("/classes/:id/pra-klinik-status", PraKlinikController.handleGetClassPraKlinikStatus);

// Get pra-klinik status for specific student (detailed breakdown)
// Returns: student info, quiz submissions with scores, PCES tests with scores
// Updates student.preClinicalPassed = true if totalScore >= 60
praKlinikRoutes.get("/students/:studentId/pra-klinik-status", PraKlinikController.handleGetStudentPraKlinikStatus);