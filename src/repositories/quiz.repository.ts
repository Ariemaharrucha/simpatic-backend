import prisma from "../utils/prisma";
import { Prisma } from "../generated/prisma/client";
import {
  ICreateQuizRequest,
  ICreateQuestionRequest,
  QuizType,
} from "../types/quiz.types";

export const QuizRepository = {
  createQuiz: async (
    data: ICreateQuizRequest & { lecturerId: number }
  ) => {
    return await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: {
          courseId: data.courseId,
          classId: data.classId,
          lecturerId: data.lecturerId,
          title: data.title,
          description: data.description,
          quizType: data.quizType,
        },
      });

      const questions = await Promise.all(
        data.questions.map((q, index) =>
          tx.quizQuestion.create({
            data: {
              quizId: quiz.id,
              questionText: q.questionText,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              correctAnswer: q.correctAnswer,
              points: new Prisma.Decimal(q.points),
              orderNumber: q.orderNumber ?? index + 1,
            },
          })
        )
      );

      return { ...quiz, questions };
    });
  },

  findById: async (id: number) => {
    return await prisma.quiz.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        quizQuestions: {
          orderBy: {
            orderNumber: "asc",
          },
        },
      },
    });
  },

  findByLecturer: async (lecturerId: number, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where: { lecturerId },
        skip,
        take: limit,
        include: {
          course: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
            },
          },
          quizQuestions: {
            select: {
              id: true,
              points: true,
            },
          },
          _count: {
            select: {
              quizQuestions: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.quiz.count({
        where: { lecturerId },
      }),
    ]);

    return { quizzes, total, page, limit };
  },

  findAvailableForStudent: async (classId: number, studentId: number) => {
    const quizzes = await prisma.quiz.findMany({
      where: {
        classId,
        quizSubmissions: {
          none: {
            studentId,
          },
        },
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        quizQuestions: {
          select: {
            id: true,
            points: true,
          },
        },
        _count: {
          select: {
            quizQuestions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return quizzes;
  },

  createQuestion: async (
    quizId: number,
    data: ICreateQuestionRequest
  ) => {
    return await prisma.quizQuestion.create({
      data: {
        quizId,
        questionText: data.questionText,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        correctAnswer: data.correctAnswer,
        points: new Prisma.Decimal(data.points),
        orderNumber: data.orderNumber,
      },
    });
  },

  deleteQuestion: async (id: number) => {
    return await prisma.quizQuestion.delete({
      where: { id },
    });
  },

  createSubmission: async (data: {
    quizId: number;
    studentId: number;
    answers: {
      questionId: number;
      answerText: string;
      isCorrect?: boolean;
      pointsEarned?: number;
    }[];
    score?: number;
    isGraded: boolean;
  }) => {
    return await prisma.$transaction(async (tx) => {
      const submission = await tx.quizSubmission.create({
        data: {
          quizId: data.quizId,
          studentId: data.studentId,
          score: data.score ? new Prisma.Decimal(data.score) : null,
          isGraded: data.isGraded,
        },
      });

      await Promise.all(
        data.answers.map((answer) =>
          tx.quizAnswer.create({
            data: {
              submissionId: submission.id,
              questionId: answer.questionId,
              answerText: answer.answerText,
              isCorrect: answer.isCorrect,
              pointsEarned: answer.pointsEarned
                ? new Prisma.Decimal(answer.pointsEarned)
                : null,
            },
          })
        )
      );

      return submission;
    });
  },

  findSubmissionById: async (id: number) => {
    return await prisma.quizSubmission.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            quizQuestions: true,
          },
        },
        quizAnswers: {
          include: {
            question: true,
          },
        },
      },
    });
  },

  findSubmissionByQuizAndStudent: async (quizId: number, studentId: number) => {
    return await prisma.quizSubmission.findUnique({
      where: {
        quizId_studentId: {
          quizId,
          studentId,
        },
      },
    });
  },

  updateSubmissionScore: async (id: number, score: number, isGraded: boolean) => {
    return await prisma.quizSubmission.update({
      where: { id },
      data: {
        score: new Prisma.Decimal(score),
        isGraded,
      },
    });
  },

  updateAnswerGrade: async (id: number, pointsEarned: number) => {
    return await prisma.quizAnswer.update({
      where: { id },
      data: {
        pointsEarned: new Prisma.Decimal(pointsEarned),
      },
    });
  },

  findSubmissionsByQuiz: async (quizId: number) => {
    return await prisma.quizSubmission.findMany({
      where: { quizId },
      include: {
        student: {
          select: {
            id: true,
            nim: true,
            name: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });
  },

  findSubmissionsByStudent: async (studentId: number) => {
    return await prisma.quizSubmission.findMany({
      where: { studentId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            quizType: true,
            course: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });
  },

  countQuestions: async (quizId: number) => {
    return await prisma.quizQuestion.count({
      where: { quizId },
    });
  },

  sumQuestionPoints: async (quizId: number) => {
    const result = await prisma.quizQuestion.aggregate({
      where: { quizId },
      _sum: {
        points: true,
      },
    });
    return result._sum.points ?? new Prisma.Decimal(0);
  },
};
