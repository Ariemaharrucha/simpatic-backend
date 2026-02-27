import { QuizRepository } from "../repositories/quiz.repository";
import { PcesRepository } from "../repositories/pces.repository";
import { StudentRepository } from "../repositories/student.repository";
import { Prisma } from "../generated/prisma/client";

const PASSING_THRESHOLD = 60;

export interface IPraKlinikScore {
  quizScore: number;
  pcesScore: number;
  totalScore: number;
  quizCount: number;
  pcesCount: number;
}

export interface IPraKlinikReport {
  studentId: number;
  quiz: {
    averageScore: number;
    submissions: {
      id: number;
      quizTitle: string;
      quizType: string;
      score: number | null;
      isGraded: boolean;
      submittedAt: Date;
    }[];
  };
  pces: {
    averageScore: number;
    tests: {
      id: number;
      templateName: string;
      totalScore: number | null;
      testDate: Date;
    }[];
  };
  summary: {
    totalScore: number;
    isPassed: boolean;
    passingThreshold: number;
  };
}

export const PraKlinikCalculationService = {
  calculatePraKlinikScore: async (studentId: number): Promise<IPraKlinikScore> => {
    const quizSubmissions = await QuizRepository.findSubmissionsByStudent(studentId);
    const gradedQuizzes = quizSubmissions.filter((s) => s.isGraded && s.score !== null);

    let quizScore = 0;
    if (gradedQuizzes.length > 0) {
      const quizSum = gradedQuizzes.reduce(
        (acc, s) => acc + (s.score as Prisma.Decimal).toNumber(),
        0
      );
      quizScore = quizSum / gradedQuizzes.length;
    }

    const pcesTests = await PcesRepository.findTestsByStudent(studentId);
    let pcesScore = 0;
    if (pcesTests.length > 0) {
      const pcesSum = pcesTests.reduce(
        (acc, t) => acc + (t.totalScore ? (t.totalScore as Prisma.Decimal).toNumber() : 0),
        0
      );
      pcesScore = pcesSum / pcesTests.length;
    }

    const totalScore = quizScore * 0.5 + pcesScore * 0.5;

    return {
      quizScore,
      pcesScore,
      totalScore,
      quizCount: gradedQuizzes.length,
      pcesCount: pcesTests.length,
    };
  },

  checkPraKlinikPassStatus: async (studentId: number) => {
    const { quizScore, pcesScore, totalScore, quizCount, pcesCount } = await PraKlinikCalculationService.calculatePraKlinikScore(studentId);

    const isPassed = totalScore >= PASSING_THRESHOLD;

    if (quizCount > 0 || pcesCount > 0) {
      await StudentRepository.updatePreClinicalStatus(studentId, isPassed, totalScore);
    }

    return {
      isPassed,
      quizScore,
      pcesScore,
      totalScore,
      quizCount,
      pcesCount,
      passingThreshold: PASSING_THRESHOLD,
    };
  },

  getPraKlinikReport: async (studentId: number): Promise<IPraKlinikReport> => {
    const quizSubmissions = await QuizRepository.findSubmissionsByStudent(studentId);
    const pcesTests = await PcesRepository.findTestsByStudent(studentId);
    const { quizScore, pcesScore, totalScore } = await PraKlinikCalculationService.calculatePraKlinikScore(studentId);

    const isPassed = totalScore >= PASSING_THRESHOLD;

    return {
      studentId,
      quiz: {
        averageScore: quizScore,
        submissions: quizSubmissions.map((s) => ({
          id: s.id,
          quizTitle: s.quiz.title,
          quizType: s.quiz.quizType,
          score: s.score ? (s.score as Prisma.Decimal).toNumber() : null,
          isGraded: s.isGraded,
          submittedAt: s.submittedAt,
        })),
      },
      pces: {
        averageScore: pcesScore,
        tests: pcesTests.map((t) => ({
          id: t.id,
          templateName: t.template?.name ?? "",
          totalScore: t.totalScore
            ? (t.totalScore as Prisma.Decimal).toNumber()
            : null,
          testDate: t.testDate,
        })),
      },
      summary: {
        totalScore,
        isPassed,
        passingThreshold: PASSING_THRESHOLD,
      },
    };
  },
};
