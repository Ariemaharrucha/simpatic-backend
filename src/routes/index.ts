import { Router } from "express";
import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";
import classesRoutes from "./admin/classes.routes";
import coursesRoutes from "./admin/courses.routes";
import praKlinikRoutes from "./admin/pra-klinik.routes";
import quizRoutes from "./pra-klinik/quiz.routes";
import pcesRoutes from "./pra-klinik/pces.routes";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Auth routes (public)
router.use("/auth", authRoutes);

// Admin routes (admin only)
router.use("/admin", adminRoutes);
router.use("/admin/classes", authenticate, authorize("admin"), classesRoutes);
router.use("/admin/courses", authenticate, authorize("admin"), coursesRoutes);
router.use("/admin/pra-klinik", authenticate, authorize("admin"), praKlinikRoutes);

// Pra Klinik routes (lecturer and student)
router.use("/pra-klinik/quizzes", authenticate, quizRoutes);
router.use("/pra-klinik/pces", authenticate, pcesRoutes);

// TODO: Add other routes here
// router.use("/lecturer", authenticate, authorize("lecturer"), lecturerRoutes);
// router.use("/student", authenticate, authorize("student"), studentRoutes);

export default router;
