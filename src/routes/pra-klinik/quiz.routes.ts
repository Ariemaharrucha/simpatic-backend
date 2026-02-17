import { Router } from "express";
import { QuizController } from "../../controllers/pra-klinik/quiz.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

// Student routes - MUST be before /:id to avoid conflict
router.get("/available", authenticate, authorize("student"), QuizController.handleGetAvailableQuizzes);

router.get("/my-results", authenticate, authorize("student"), QuizController.handleGetMyResults);

// Lecturer routes
router.post("/", authenticate, authorize("lecturer"), QuizController.handleCreateQuiz);

router.get("/lecturer", authenticate, authorize("lecturer"), QuizController.handleGetLecturerQuizzes);

router.get("/:id", authenticate, authorize("lecturer"), QuizController.handleGetQuizDetail);

router.get("/:id/submissions", authenticate, authorize("lecturer"), QuizController.handleGetQuizSubmissions);

router.post("/:id/questions", authenticate, authorize("lecturer"), QuizController.handleCreateQuestion);

router.post("/:id/submissions/:submissionId/grade", authenticate, authorize("lecturer"), QuizController.handleGradeEssay);

router.get("/:id/statistics", authenticate, authorize("lecturer"), QuizController.handleGetStatistics);

// Student routes with params
router.get("/:id/take", authenticate, authorize("student"), QuizController.handleGetQuizForTaking);

router.post("/:id/submit", authenticate, authorize("student"), QuizController.handleSubmitQuiz);

router.get("/submissions/:id", authenticate, authorize("student"), QuizController.handleGetSubmissionDetail);

export default router;
