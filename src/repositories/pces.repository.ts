import prisma from "../utils/prisma";
import { Prisma } from "../generated/prisma/client";
import { ICreateTemplateRequest, ICreatePcesTestRequest } from "../types/pces.types";

export const PcesRepository = {
  createTemplate: async (data: ICreateTemplateRequest) => {
    return await prisma.$transaction(async (tx) => {
      const template = await tx.pcesTestTemplate.create({
        data: {
          name: data.name,
          description: data.description,
        },
      });

      const sopItems = await Promise.all(
        data.sopItems.map((item, index) =>
          tx.pcesSopItem.create({
            data: {
              templateId: template.id,
              sopDescription: item.sopDescription,
              orderNumber: item.orderNumber ?? index + 1,
            },
          })
        )
      );

      return { ...template, sopItems };
    });
  },

  findTemplateById: async (id: number) => {
    return await prisma.pcesTestTemplate.findUnique({
      where: { id },
      include: {
        pcesSopItems: {
          orderBy: {
            orderNumber: "asc",
          },
        },
      },
    });
  },

  findAllTemplates: async () => {
    return await prisma.pcesTestTemplate.findMany({
      include: {
        _count: {
          select: {
            pcesSopItems: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  updateTemplate: async (
    id: number,
    data: { name?: string; description?: string }
  ) => {
    return await prisma.pcesTestTemplate.update({
      where: { id },
      data,
    });
  },

  deleteTemplate: async (id: number) => {
    return await prisma.pcesTestTemplate.delete({
      where: { id },
    });
  },

  createPcesTest: async (
    data: ICreatePcesTestRequest & { lecturerId: number; totalScore: number }
  ) => {
    return await prisma.$transaction(async (tx) => {
      const test = await tx.pcesTest.create({
        data: {
          templateId: data.templateId,
          studentId: data.studentId,
          lecturerId: data.lecturerId,
          testDate: new Date(data.testDate),
          totalScore: new Prisma.Decimal(data.totalScore),
        },
      });

      await Promise.all(
        data.scores.map((score) =>
          tx.pcesScore.create({
            data: {
              testId: test.id,
              sopItemId: score.sopItemId,
              score: score.score,
            },
          })
        )
      );

      return test;
    });
  },

  findTestById: async (id: number) => {
    return await prisma.pcesTest.findUnique({
      where: { id },
      include: {
        template: true,
        student: {
          select: {
            id: true,
            nim: true,
            name: true,
          },
        },
        lecturer: {
          select: {
            id: true,
            lecturerCode: true,
            name: true,
          },
        },
        pcesScores: {
          include: {
            sopItem: true,
          },
        },
      },
    });
  },

  findTestsByLecturer: async (lecturerId: number) => {
    return await prisma.pcesTest.findMany({
      where: { lecturerId },
      include: {
        template: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            nim: true,
            name: true,
          },
        },
      },
      orderBy: {
        testDate: "desc",
      },
    });
  },

  findTestsByStudent: async (studentId: number) => {
    return await prisma.pcesTest.findMany({
      where: { studentId },
      include: {
        template: {
          select: {
            id: true,
            name: true,
          },
        },
        pcesScores: {
          include: {
            sopItem: true,
          },
        },
      },
      orderBy: {
        testDate: "desc",
      },
    });
  },

  countTestsByStudent: async (studentId: number) => {
    return await prisma.pcesTest.count({
      where: { studentId },
    });
  },
};
