import { PcesRepository } from "../repositories/pces.repository";
import { StudentRepository } from "../repositories/student.repository";
import { NotFoundError, ValidationError } from "../middleware/error.middleware";
import { Prisma } from "../generated/prisma/client";
import {
  ICreateTemplateRequest,
  ICreatePcesTestRequest,
  IPcesTemplateResponse,
  IPcesTemplateDetailResponse,
  IPcesTestResponse,
  IPcesTestDetailResponse,
  IPcesStudentResultResponse,
} from "../types/pces.types";

export const PcesService = {
  createTemplate: async (data: ICreateTemplateRequest) => {
    if (!data.sopItems || data.sopItems.length === 0) {
      throw new ValidationError("Template must have at least 1 SOP item");
    }

    return await PcesRepository.createTemplate(data);
  },

  getAllTemplates: async (): Promise<IPcesTemplateResponse[]> => {
    const templates = await PcesRepository.findAllTemplates();

    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? undefined,
      sopItemCount: t._count.pcesSopItems,
      createdAt: t.createdAt,
    }));
  },

  getTemplateDetail: async (id: number): Promise<IPcesTemplateDetailResponse> => {
    const template = await PcesRepository.findTemplateById(id);
    if (!template) {
      throw new NotFoundError("Template not found");
    }

    return {
      id: template.id,
      name: template.name,
      description: template.description ?? undefined,
      sopItems: template.pcesSopItems.map((item) => ({
        id: item.id,
        sopDescription: item.sopDescription,
        orderNumber: item.orderNumber,
      })),
      createdAt: template.createdAt,
    };
  },

  createPcesTest: async (
    data: ICreatePcesTestRequest,
    lecturerId: number
  ): Promise<IPcesTestDetailResponse> => {
    const template = await PcesRepository.findTemplateById(data.templateId);
    if (!template) {
      throw new NotFoundError("Template not found");
    }

    const studentExists = await StudentRepository.exists(data.studentId);
    if (!studentExists) {
      throw new NotFoundError("Student not found");
    }

    const sopItemIds = template.pcesSopItems.map((item) => item.id);
    const scoredItemIds = data.scores.map((s) => s.sopItemId);
    const allScored = sopItemIds.every((id) => scoredItemIds.includes(id));

    if (!allScored) {
      throw new ValidationError("All SOP items must be scored");
    }

    data.scores.forEach((score, index) => {
      if (score.score < 1 || score.score > 5) {
        throw new ValidationError(
          `Score for item ${index + 1} must be between 1 and 5`
        );
      }
    });

    const sumScores = data.scores.reduce((acc, s) => acc + s.score, 0);
    const avgScore = sumScores / data.scores.length;
    const totalScore = avgScore * 20;

    const test = await PcesRepository.createPcesTest({
      ...data,
      lecturerId,
      totalScore,
    });

    const testDetail = await PcesRepository.findTestById(test.id);
    if (!testDetail) {
      throw new NotFoundError("Test not found after creation");
    }

    return {
      id: testDetail.id,
      testDate: testDetail.testDate,
      totalScore: testDetail.totalScore
        ? (testDetail.totalScore as Prisma.Decimal).toNumber()
        : undefined,
      template: {
        id: testDetail.template.id,
        name: testDetail.template.name,
      },
      student: {
        id: testDetail.student.id,
        nim: testDetail.student.nim,
        name: testDetail.student.name,
      },
      scores: testDetail.pcesScores.map((s) => ({
        id: s.id,
        sopItemId: s.sopItemId,
        sopDescription: s.sopItem.sopDescription,
        score: s.score,
      })),
    };
  },

  getLecturerTests: async (lecturerId: number): Promise<IPcesTestResponse[]> => {
    const tests = await PcesRepository.findTestsByLecturer(lecturerId);

    return tests.map((t) => ({
      id: t.id,
      testDate: t.testDate,
      totalScore: t.totalScore
        ? (t.totalScore as Prisma.Decimal).toNumber()
        : undefined,
      template: {
        id: t.template.id,
        name: t.template.name,
      },
      student: {
        id: t.student.id,
        nim: t.student.nim,
        name: t.student.name,
      },
    }));
  },

  getTestDetail: async (
    testId: number,
    lecturerId: number
  ): Promise<IPcesTestDetailResponse> => {
    const test = await PcesRepository.findTestById(testId);
    if (!test) {
      throw new NotFoundError("Test not found");
    }

    if (test.lecturerId !== lecturerId) {
      throw new NotFoundError("Test not found");
    }

    return {
      id: test.id,
      testDate: test.testDate,
      totalScore: test.totalScore
        ? (test.totalScore as Prisma.Decimal).toNumber()
        : undefined,
      template: {
        id: test.template.id,
        name: test.template.name,
      },
      student: {
        id: test.student.id,
        nim: test.student.nim,
        name: test.student.name,
      },
      scores: test.pcesScores.map((s) => ({
        id: s.id,
        sopItemId: s.sopItemId,
        sopDescription: s.sopItem.sopDescription,
        score: s.score,
      })),
    };
  },

  getStudentResults: async (
    studentId: number
  ): Promise<IPcesStudentResultResponse[]> => {
    const tests = await PcesRepository.findTestsByStudent(studentId);

    return tests.map((t) => ({
      id: t.id,
      testDate: t.testDate,
      totalScore: t.totalScore
        ? (t.totalScore as Prisma.Decimal).toNumber()
        : 0,
      template: {
        id: t.template.id,
        name: t.template.name,
      },
    }));
  },

  calculatePcesScore: async (testId: number) => {
    const test = await PcesRepository.findTestById(testId);
    if (!test) {
      throw new NotFoundError("Test not found");
    }

    const totalScore = test.totalScore
      ? (test.totalScore as Prisma.Decimal).toNumber()
      : 0;

    return {
      testId: test.id,
      studentName: test.student?.name,
      templateName: test.template?.name,
      totalScore,
      isPassed: totalScore >= 60,
    };
  },
};
