import { QuizRepository } from "../repositories/quiz.repository";
import { CourseRepository } from "../repositories/course.repository";
import { ClassRepository } from "../repositories/class.repository";
import { NotFoundError, ForbiddenError, ValidationError } from "../middleware/error.middleware";
import { Prisma } from "../generated/prisma/client";
import prisma from "../utils/prisma";
import {
  ICreateQuizRequest,
  ICreateQuestionRequest,
  ISubmitAnswerRequest,
  IQuizResponse,
  IQuizDetailResponse,
  IQuizSubmissionResponse,
  IQuizStatisticsResponse,
} from "../types/quiz.types";

export const QuizService = {
  createQuiz: async (data: ICreateQuizRequest, lecturerId: number) => {
    const course = await CourseRepository.findById(data.courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    const classData = await ClassRepository.findById(data.classId);
    if (!classData) {
      throw new NotFoundError("Class not found");
    }

    const teachesCourse = await CourseRepository.isLecturerInCourse(
      data.courseId,
      lecturerId
    );
    if (!teachesCourse) {
      throw new ForbiddenError("You don't teach this course");
    }

    if (!data.questions || data.questions.length === 0) {
      throw new ValidationError("Quiz must have at least 1 question");
    }

    if (data.quizType === "multiple_choice") {
      data.questions.forEach((q, index) => {
        if (!q.optionA || !q.optionB || !q.optionC || !q.optionD) {
          throw new ValidationError(
            `Question ${index + 1}: Multiple choice requires all 4 options`
          );
        }
        if (!q.correctAnswer || !["A", "B", "C", "D"].includes(q.correctAnswer)) {
          throw new ValidationError(
            `Question ${index + 1}: Multiple choice requires a valid correct answer (A/B/C/D)`
          );
        }
      });
    } else if (data.quizType === "essay") {
      data.questions.forEach((q, index) => {
        if (q.optionA || q.optionB || q.optionC || q.optionD || q.correctAnswer) {
          throw new ValidationError(
            `Question ${index + 1}: Essay questions should not have options or correct answer`
          );
        }
      });
    }

    return await QuizRepository.createQuiz({
      ...data,
      lecturerId,
    });
  },

  getQuizForLecturer: async (quizId: number, lecturerId: number) => {
    const quiz = await QuizRepository.findById(quizId);

    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    if (quiz.lecturerId !== lecturerId) {
      throw new ForbiddenError("You don't have access to this quiz");
    }

    const totalPoints = quiz.quizQuestions.reduce(
      (sum, q) => sum + (q.points as Prisma.Decimal).toNumber(),
      0
    );

    const response = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description ?? undefined,
      quizType: quiz.quizType,
      course: quiz.course,
      class: quiz.class,
      questions: quiz.quizQuestions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        optionA: q.optionA ?? undefined,
        optionB: q.optionB ?? undefined,
        optionC: q.optionC ?? undefined,
        optionD: q.optionD ?? undefined,
        correctAnswer: q.correctAnswer ?? undefined,
        points: (q.points as Prisma.Decimal).toNumber(),
        orderNumber: q.orderNumber ?? undefined,
      })),
    };

    return response;
  },

  getQuizForStudent: async (quizId: number, studentId: number) => {
    const quiz = await QuizRepository.findById(quizId);

    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    const isInClass = await ClassRepository.isStudentInClass(quiz.classId, studentId);
    if (!isInClass) {
      throw new ForbiddenError("You are not enrolled in this class");
    }

    const existingSubmission = await QuizRepository.findSubmissionByQuizAndStudent(
      quizId,
      studentId
    );
    if (existingSubmission) {
      throw new ForbiddenError("You have already submitted this quiz");
    }

    const totalPoints = quiz.quizQuestions.reduce(
      (sum, q) => sum + (q.points as Prisma.Decimal).toNumber(),
      0
    );

    const response: IQuizDetailResponse = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description ?? undefined,
      quizType: quiz.quizType,
      course: quiz.course,
      class: quiz.class,
      questions: quiz.quizQuestions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        optionA: q.optionA ?? undefined,
        optionB: q.optionB ?? undefined,
        optionC: q.optionC ?? undefined,
        optionD: q.optionD ?? undefined,
        points: (q.points as Prisma.Decimal).toNumber(),
        orderNumber: q.orderNumber ?? undefined,
      })),
    };

    return response;
  },

  getLecturerQuizzes: async (lecturerId: number, page: number, limit: number) => {
    const result = await QuizRepository.findByLecturer(lecturerId, page, limit);

    const quizzes: IQuizResponse[] = result.quizzes.map((quiz: any) => {
      const totalPoints = quiz.quizQuestions?.reduce(
        (sum: number, q: any) => sum + (q.points as Prisma.Decimal).toNumber(),
        0
      ) ?? 0;

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description ?? undefined,
        quizType: quiz.quizType,
        course: quiz.course,
        class: quiz.class,
        questionCount: quiz._count?.quizQuestions ?? 0,
        totalPoints,
        createdAt: quiz.createdAt,
      };
    });

    return {
      quizzes,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  },

  getAvailableQuizzes: async (studentId: number) => {
    const classWithStudents = await prisma.classStudent.findFirst({
      where: { studentId },
      include: { class: true },
    });

    if (!classWithStudents) {
      return { quizzes: [], total: 0 };
    }

    const classId = classWithStudents.classId;
    const quizzes = await QuizRepository.findAvailableForStudent(classId, studentId);

    const response: IQuizResponse[] = quizzes.map((quiz: any) => {
      const totalPoints = quiz.quizQuestions?.reduce(
        (sum: number, q: any) => sum + (q.points as Prisma.Decimal).toNumber(),
        0
      ) ?? 0;

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description ?? undefined,
        quizType: quiz.quizType,
        course: quiz.course,
        class: {
          id: classWithStudents.classId,
          name: classWithStudents.class.name,
        },
        questionCount: quiz._count?.quizQuestions ?? 0,
        totalPoints,
        createdAt: quiz.createdAt,
      };
    });

    return { quizzes: response, total: response.length };
  },

  createQuestion: async (
    quizId: number,
    data: ICreateQuestionRequest,
    lecturerId: number
  ) => {
    const quiz = await QuizRepository.findById(quizId);

    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    if (quiz.lecturerId !== lecturerId) {
      throw new ForbiddenError("You don't have access to this quiz");
    }

    if (quiz.quizType === "multiple_choice") {
      if (!data.optionA || !data.optionB || !data.optionC || !data.optionD) {
        throw new ValidationError("Multiple choice requires all 4 options");
      }
      if (!data.correctAnswer || !["A", "B", "C", "D"].includes(data.correctAnswer)) {
        throw new ValidationError("Multiple choice requires a valid correct answer (A/B/C/D)");
      }
    } else if (quiz.quizType === "essay") {
      if (data.optionA || data.optionB || data.optionC || data.optionD || data.correctAnswer) {
        throw new ValidationError("Essay questions should not have options or correct answer");
      }
    }

    return await QuizRepository.createQuestion(quizId, data);
  },

  submitQuiz: async (
    data: { quizId: number; answers: ISubmitAnswerRequest[] },
    studentId: number
  ) => {
    const quiz = await QuizRepository.findById(data.quizId);

    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    const existingSubmission = await QuizRepository.findSubmissionByQuizAndStudent(
      data.quizId,
      studentId
    );
    if (existingSubmission) {
      throw new ForbiddenError("You have already submitted this quiz");
    }

    const isInClass = await ClassRepository.isStudentInClass(quiz.classId, studentId);
    if (!isInClass) {
      throw new ForbiddenError("You are not enrolled in this class");
    }

    const questionIds = quiz.quizQuestions.map((q) => q.id);
    const answeredQuestionIds = data.answers.map((a) => a.questionId);
    const allAnswered = questionIds.every((id) => answeredQuestionIds.includes(id));

    if (!allAnswered) {
      throw new ValidationError("All questions must be answered");
    }

    let totalScore = new Prisma.Decimal(0);
    let totalPoints = new Prisma.Decimal(0);
    const processedAnswers = [];
    let isGraded = true;

    for (const answer of data.answers) {
      const question = quiz.quizQuestions.find((q) => q.id === answer.questionId);
      if (!question) {
        throw new ValidationError(`Invalid question ID: ${answer.questionId}`);
      }

      totalPoints = totalPoints.add(question.points as Prisma.Decimal);

      let isCorrect: boolean | undefined;
      let pointsEarned: number | undefined;

      if (quiz.quizType === "multiple_choice") {
        isCorrect = answer.answerText.toUpperCase() === question.correctAnswer?.toUpperCase();
        pointsEarned = isCorrect ? (question.points as Prisma.Decimal).toNumber() : 0;
        totalScore = totalScore.add(pointsEarned);
      } else {
        isCorrect = undefined;
        pointsEarned = undefined;
        isGraded = false;
      }

      processedAnswers.push({
        questionId: answer.questionId,
        answerText: answer.answerText,
        isCorrect,
        pointsEarned,
      });
    }

    const finalScore = totalPoints.greaterThan(0)
      ? totalScore.dividedBy(totalPoints).mul(100).toNumber()
      : 0;

    return await QuizRepository.createSubmission({
      quizId: data.quizId,
      studentId,
      answers: processedAnswers,
      score: isGraded ? finalScore : undefined,
      isGraded,
    });
  },

  gradeEssay: async (
    submissionId: number,
    questionId: number,
    pointsEarned: number,
    lecturerId: number
  ) => {
    const submission = await QuizRepository.findSubmissionById(submissionId);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    if (submission.quiz.lecturerId !== lecturerId) {
      throw new ForbiddenError("You don't have access to grade this submission");
    }

    if (submission.quiz.quizType !== "essay") {
      throw new ValidationError("This quiz is not an essay quiz");
    }

    const answer = submission.quizAnswers.find((a) => a.questionId === questionId);
    if (!answer) {
      throw new NotFoundError("Answer not found");
    }

    const question = submission.quiz.quizQuestions.find((q) => q.id === questionId);
    if (!question) {
      throw new NotFoundError("Question not found");
    }

    const maxPoints = (question.points as Prisma.Decimal).toNumber();
    if (pointsEarned < 0 || pointsEarned > maxPoints) {
      throw new ValidationError(`Points must be between 0 and ${maxPoints}`);
    }

    await QuizRepository.updateAnswerGrade(answer.id, pointsEarned);

    let totalScore = new Prisma.Decimal(0);
    let totalPoints = new Prisma.Decimal(0);
    let allGraded = true;

    for (const ans of submission.quizAnswers) {
      const q = submission.quiz.quizQuestions.find((qq) => qq.id === ans.questionId);
      if (q) {
        totalPoints = totalPoints.add(q.points as Prisma.Decimal);
        if (ans.questionId === questionId) {
          totalScore = totalScore.add(pointsEarned);
        } else if (ans.pointsEarned !== null) {
          totalScore = totalScore.add(ans.pointsEarned as Prisma.Decimal);
        } else {
          allGraded = false;
        }
      }
    }

    if (allGraded) {
      const finalScore = totalPoints.greaterThan(0)
        ? totalScore.dividedBy(totalPoints).mul(100).toNumber()
        : 0;
      await QuizRepository.updateSubmissionScore(submissionId, finalScore, true);
    }
  },

  getStudentResults: async (studentId: number) => {
    const submissions = await QuizRepository.findSubmissionsByStudent(studentId);

    const results = await Promise.all(
      submissions.map(async (submission) => {
        const quiz = await QuizRepository.findById(submission.quizId);
        const totalPoints = quiz?.quizQuestions.reduce(
          (sum, q) => sum + (q.points as Prisma.Decimal).toNumber(),
          0
        ) ?? 0;

        return {
          id: submission.id,
          quizId: submission.quizId,
          quizTitle: submission.quiz.title,
          submittedAt: submission.submittedAt,
          score: submission.score ? (submission.score as Prisma.Decimal).toNumber() : undefined,
          isGraded: submission.isGraded,
          totalPoints,
        };
      })
    );

    return results;
  },

  getQuizStatistics: async (quizId: number, lecturerId: number): Promise<IQuizStatisticsResponse> => {
    const quiz = await QuizRepository.findById(quizId);

    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    if (quiz.lecturerId !== lecturerId) {
      throw new ForbiddenError("You don't have access to this quiz");
    }

    const submissions = await QuizRepository.findSubmissionsByQuiz(quizId);
    const gradedSubmissions = submissions.filter((s) => s.isGraded && s.score !== null);

    if (gradedSubmissions.length === 0) {
      return {
        avgScore: 0,
        maxScore: 0,
        minScore: 0,
        totalSubmissions: submissions.length,
        quizType: quiz.quizType,
      };
    }

    const scores = gradedSubmissions.map((s) => (s.score as Prisma.Decimal).toNumber());

    return {
      avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
      totalSubmissions: submissions.length,
      quizType: quiz.quizType,
    };
  },

  getQuizSubmissions: async (quizId: number, lecturerId: number) => {
    const quiz = await QuizRepository.findById(quizId);

    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    if (quiz.lecturerId !== lecturerId) {
      throw new ForbiddenError("You don't have access to this quiz");
    }

    const submissions = await QuizRepository.findSubmissionsByQuiz(quizId);
    return submissions;
  },

  getSubmissionDetail: async (submissionId: number, studentId: number) => {
    const submission = await QuizRepository.findSubmissionById(submissionId);

    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    if (submission.studentId !== studentId) {
      throw new ForbiddenError("You don't have access to this submission");
    }

    return submission;
  },
};
