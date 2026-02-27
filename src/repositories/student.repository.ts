import prisma from "../utils/prisma";
import { Prisma } from "../generated/prisma/client";

export const StudentRepository = {
  findById: async (id: number) => {
    return await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
          },
        },
      },
    });
  },

  findByNIM: async (nim: string) => {
    return await prisma.student.findUnique({
      where: { nim },
    });
  },

  findAll: async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.student.count(),
    ]);

    return { students, total, page, limit };
  },

  updatePreClinicalStatus: async (
    studentId: number,
    isPassed: boolean,
    totalScore: number
  ) => {
    return await prisma.student.update({
      where: { id: studentId },
      data: {
        preClinicalPassed: isPassed,
        preClinicalScore: new Prisma.Decimal(totalScore),
      },
    });
  },

  updateFinalScore: async (
    studentId: number,
    clinicalScore: number,
    finalScore: number
  ) => {
    return await prisma.student.update({
      where: { id: studentId },
      data: {
        clinicalScore: new Prisma.Decimal(clinicalScore),
        finalScore: new Prisma.Decimal(finalScore),
      },
    });
  },

  publishFinalScore: async (studentId: number) => {
    return await prisma.student.update({
      where: { id: studentId },
      data: {
        finalScorePublished: true,
      },
    });
  },

  exists: async (studentId: number): Promise<boolean> => {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    return !!student;
  },
};
