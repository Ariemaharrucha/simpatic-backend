import { Prisma } from "../generated/prisma/client";

export interface IPcesTestTemplate {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPcesSopItem {
  id: number;
  templateId: number;
  sopDescription: string;
  orderNumber: number;
  createdAt: Date;
}

export interface IPcesTest {
  id: number;
  templateId: number;
  studentId: number;
  lecturerId: number;
  testDate: Date;
  totalScore?: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPcesScore {
  id: number;
  testId: number;
  sopItemId: number;
  score: number;
  createdAt: Date;
}

export interface ICreateTemplateRequest {
  name: string;
  description?: string;
  sopItems: ICreateSopItemRequest[];
}

export interface ICreateSopItemRequest {
  sopDescription: string;
  orderNumber?: number;
}

export interface ICreatePcesTestRequest {
  templateId: number;
  studentId: number;
  testDate: string;
  scores: ICreatePcesScoreRequest[];
}

export interface ICreatePcesScoreRequest {
  sopItemId: number;
  score: number;
}

export interface IPcesTemplateResponse {
  id: number;
  name: string;
  description?: string;
  sopItemCount: number;
  createdAt: Date;
}

export interface IPcesTemplateDetailResponse {
  id: number;
  name: string;
  description?: string;
  sopItems: {
    id: number;
    sopDescription: string;
    orderNumber: number;
  }[];
  createdAt: Date;
}

export interface IPcesTestResponse {
  id: number;
  testDate: Date;
  totalScore?: number;
  template: {
    id: number;
    name: string;
  };
  student: {
    id: number;
    nim: string;
    name: string;
  };
}

export interface IPcesTestDetailResponse {
  id: number;
  testDate: Date;
  totalScore?: number;
  template: {
    id: number;
    name: string;
  };
  student: {
    id: number;
    nim: string;
    name: string;
  };
  scores: {
    id: number;
    sopItemId: number;
    sopDescription: string;
    score: number;
  }[];
}

export interface IPcesStudentResultResponse {
  id: number;
  testDate: Date;
  totalScore: number;
  template: {
    id: number;
    name: string;
  };
}
