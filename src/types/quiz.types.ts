import { Prisma } from "../generated/prisma/client";

export type QuizType = "multiple_choice" | "essay";

// Quiz Types
export interface IQuiz {
  id: number;
  courseId: number;
  classId: number;
  lecturerId: number;
  title: string;
  description?: string;
  quizType: QuizType;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizQuestion {
  id: number;
  quizId: number;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  points: Prisma.Decimal;
  orderNumber?: number;
  createdAt: Date;
}

export interface IQuizSubmission {
  id: number;
  quizId: number;
  studentId: number;
  submittedAt: Date;
  score?: Prisma.Decimal;
  isGraded: boolean;
}

export interface IQuizAnswer {
  id: number;
  submissionId: number;
  questionId: number;
  answerText?: string;
  isCorrect?: boolean;
  pointsEarned?: Prisma.Decimal;
  createdAt: Date;
}

// Request Types
export interface ICreateQuizRequest {
  courseId: number;
  classId: number;
  title: string;
  description?: string;
  quizType: QuizType;
  questions: ICreateQuestionRequest[];
}

export interface ICreateQuestionRequest {
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  points: number;
  orderNumber?: number;
}

export interface ISubmitQuizRequest {
  answers: ISubmitAnswerRequest[];
}

export interface ISubmitAnswerRequest {
  questionId: number;
  answerText: string;
}

export interface IGradeEssayRequest {
  questionId: number;
  pointsEarned: number;
}

// Response Types (safe for FE)
export interface IQuizResponse {
  id: number;
  title: string;
  description?: string;
  quizType: QuizType;
  course: {
    id: number;
    code: string;
    name: string;
  };
  class: {
    id: number;
    name: string;
  };
  questionCount: number;
  totalPoints: number;
  createdAt: Date;
}

export interface IQuizDetailResponse {
  id: number;
  title: string;
  description?: string;
  quizType: QuizType;
  course: {
    id: number;
    code: string;
    name: string;
  };
  class: {
    id: number;
    name: string;
  };
  questions: IQuizQuestionResponse[];
}

export interface IQuizQuestionResponse {
  id: number;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  points: number;
  orderNumber?: number;
}

export interface IQuizSubmissionResponse {
  id: number;
  quizId: number;
  quizTitle: string;
  submittedAt: Date;
  score?: number;
  isGraded: boolean;
  totalPoints: number;
}

export interface IQuizStatisticsResponse {
  avgScore: number;
  maxScore: number;
  minScore: number;
  totalSubmissions: number;
  quizType: QuizType;
}
