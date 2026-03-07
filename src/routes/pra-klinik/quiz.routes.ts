import { Router } from "express";
import { QuizController } from "../../controllers/pra-klinik/quiz.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

export const quizRoutes = Router();

// STATIC PATHS (no parameters)

// Student: Get quizzes available for student (from enrolled class, not yet submitted)
quizRoutes.get("/available", authenticate, authorize("student"), QuizController.handleGetAvailableQuizzes); // student

// Student: Get student's own quiz results/submissions
quizRoutes.get("/my-results", authenticate, authorize("student"), QuizController.handleGetMyResults); // student

// Lecturer: Get all quizzes created by this lecturer
quizRoutes.get("/lecturer", authenticate, authorize("lecturer"), QuizController.handleGetLecturerQuizzes); // lecturer

// Lecturer: Create new quiz (requires: courseId, classId, title, quizType, questions[])
quizRoutes.post("/", authenticate, authorize("lecturer"), QuizController.handleCreateQuiz); // lecturer

// SPECIFIC PARAMETERIZED PATHS 

// Student: Get submission detail (MUST be before /:id to avoid being captured by :id wildcard)
quizRoutes.get("/submissions/:id", authenticate, authorize("student"), QuizController.handleGetSubmissionDetail); // student

// Lecturer: Get all submissions for a specific quiz
quizRoutes.get("/:id/submissions", authenticate, authorize("lecturer"), QuizController.handleGetQuizSubmissions); // lecturer

// Lecturer: Add question to existing quiz
quizRoutes.post("/:id/questions", authenticate, authorize("lecturer"), QuizController.handleCreateQuestion); // lecturer

// Lecturer: Grade essay answer (for essay-type quizzes only)
quizRoutes.post("/:id/submissions/:submissionId/grade", authenticate, authorize("lecturer"), QuizController.handleGradeEssay); // lecturer

// Lecturer: Get quiz statistics (avgScore, minScore, maxScore, totalSubmissions)
quizRoutes.get("/:id/statistics", authenticate, authorize("lecturer"), QuizController.handleGetStatistics); // lecturer

// Student: Get quiz for student to take (hides correct answers, includes questions)
quizRoutes.get("/:id/take", authenticate, authorize("student"), QuizController.handleGetQuizForTaking); // student

// Student: Submit quiz answers (validates all questions answered, auto-grades multiple choice)
quizRoutes.post("/:id/submit", authenticate, authorize("student"), QuizController.handleSubmitQuiz); // student

// GENERIC PARAMETERIZED PATHS

// Lecturer: Get quiz detail including correct answers (lecturer only)
quizRoutes.get("/:id", authenticate, authorize("lecturer"), QuizController.handleGetQuizDetail); // lecturer