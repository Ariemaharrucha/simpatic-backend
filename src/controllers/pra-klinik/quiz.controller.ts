import { Request, Response, NextFunction } from "express";
import { QuizService } from "../../services/quiz.service";
import { ResponseUtils } from "../../utils/response.utils";
import { AuthRequest } from "../../middleware/auth.middleware";

export const QuizController = {
  handleCreateQuiz: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const quiz = await QuizService.createQuiz(req.body, lecturerId);
      return ResponseUtils.success(res, { quiz }, "Quiz created successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  handleGetLecturerQuizzes: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await QuizService.getLecturerQuizzes(lecturerId, page, limit);
      return ResponseUtils.success(res, result, "Quizzes retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetQuizDetail: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const quizId = parseInt(req.params.id as string);
      const quiz = await QuizService.getQuizForLecturer(quizId, lecturerId);
      return ResponseUtils.success(res, { quiz }, "Quiz retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetAvailableQuizzes: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.profileId;
      if (!studentId) {
        return ResponseUtils.unauthorized(res);
      }

      const result = await QuizService.getAvailableQuizzes(studentId);
      return ResponseUtils.success(res, result, "Available quizzes retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetQuizForTaking: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.profileId;
      if (!studentId) {
        return ResponseUtils.unauthorized(res);
      }

      const quizId = parseInt(req.params.id as string);
      const quiz = await QuizService.getQuizForStudent(quizId, studentId);
      return ResponseUtils.success(res, { quiz }, "Quiz retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleSubmitQuiz: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.profileId;
      if (!studentId) {
        return ResponseUtils.unauthorized(res);
      }

      const quizId = parseInt(req.params.id as string);
      const submission = await QuizService.submitQuiz(
        { quizId, answers: req.body.answers },
        studentId
      );
      return ResponseUtils.success(
        res,
        { submission },
        "Quiz submitted successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  },

  handleCreateQuestion: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const quizId = parseInt(req.params.id as string);
      const question = await QuizService.createQuestion(quizId, req.body, lecturerId);
      return ResponseUtils.success(
        res,
        { question },
        "Question created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  },

  handleGetMyResults: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.profileId;
      if (!studentId) {
        return ResponseUtils.unauthorized(res);
      }

      const results = await QuizService.getStudentResults(studentId);
      return ResponseUtils.success(res, { results }, "Results retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGradeEssay: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const submissionId = parseInt(req.params.submissionId as string);
      const { questionId, pointsEarned } = req.body;

      await QuizService.gradeEssay(submissionId, questionId, pointsEarned, lecturerId);
      return ResponseUtils.success(res, null, "Essay graded successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetStatistics: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const quizId = parseInt(req.params.id as string);
      const statistics = await QuizService.getQuizStatistics(quizId, lecturerId);
      return ResponseUtils.success(res, { statistics }, "Statistics retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetQuizSubmissions: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const quizId = parseInt(req.params.id as string);
      const submissions = await QuizService.getQuizSubmissions(quizId, lecturerId);
      return ResponseUtils.success(res, { submissions }, "Submissions retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetSubmissionDetail: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.profileId;
      if (!studentId) {
        return ResponseUtils.unauthorized(res);
      }

      const submissionId = parseInt(req.params.id as string);
      const submission = await QuizService.getSubmissionDetail(submissionId, studentId);
      return ResponseUtils.success(res, { submission }, "Submission retrieved successfully");
    } catch (error) {
      next(error);
    }
  },
};
