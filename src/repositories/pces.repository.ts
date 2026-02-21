import prisma from "../utils/prisma";
import { Prisma } from "../generated/prisma/client";
import { ICreateTemplateRequest, ICreatePcesTestRequest } from "../types/pces.types";

export const PcesRepository = {
  createTemplate: async (data: ICreateTemplateRequest) => {
    return await prisma.$transaction(async (tx) => {
      const template = await tx.pcesTestTemplate.create({
        data: {
          courseId: data.courseId,
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
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        pcesSopItems: {
          orderBy: {
            orderNumber: "asc",
          },
        },
      },
    });
  },

  findAllTemplates: async (courseId?: number) => {
    const where: any = {};
    if (courseId) {
      where.courseId = courseId;
    }

    return await prisma.pcesTestTemplate.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
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

  findTemplatesByCourses: async (courseIds: number[]) => {
    return await prisma.pcesTestTemplate.findMany({
      where: {
        courseId: {
          in: courseIds,
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
    data: ICreatePcesTestRequest & { lecturerId: number; courseId: number; totalScore: number }
  ) => {
    return await prisma.$transaction(async (tx) => {
      const test = await tx.pcesTest.create({
        data: {
          templateId: data.templateId,
          courseId: data.courseId,
          classId: data.classId,
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
        template: {
          select: {
            id: true,
            name: true,
          },
        },
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
            academicYear: true,
          },
        },
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
            academicYear: true,
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
        course: {
          select: {
            id: true,
            code: true,
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

  findClassesWithQuizzesByCourse: async (courseId: number) => {
    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      select: {
        classId: true,
        class: {
          select: {
            id: true,
            name: true,
            academicYear: true,
          },
        },
      },
      distinct: ["classId"],
    });

    return quizzes.map((q) => ({
      ...q.class,
      studentCount: 0,
    }));
  },

  findClassesWithQuizzesByCourseWithStudentCount: async (courseId: number) => {
    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      select: {
        classId: true,
      },
      distinct: ["classId"],
    });

    const classIds = quizzes.map((q) => q.classId);

    if (classIds.length === 0) {
      return [];
    }

    const classes = await prisma.class.findMany({
      where: {
        id: {
          in: classIds,
        },
      },
      include: {
        _count: {
          select: {
            classStudents: true,
          },
        },
      },
    });

    return classes.map((c) => ({
      id: c.id,
      name: c.name,
      academicYear: c.academicYear,
      studentCount: c._count.classStudents,
    }));
  },

  findStudentsByClass: async (classId: number) => {
    const classStudents = await prisma.classStudent.findMany({
      where: { classId },
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
        student: {
          nim: "asc",
        },
      },
    });

    return classStudents.map((cs) => ({
      id: cs.student.id,
      nim: cs.student.nim,
      name: cs.student.name,
    }));
  },

  findTestByTemplateAndStudent: async (templateId: number, studentId: number) => {
    return await prisma.pcesTest.findFirst({
      where: {
        templateId,
        studentId,
      },
    });
  },

  updatePcesTest: async (
    testId: number,
    data: {
      testDate: Date;
      totalScore: number;
      scores: { sopItemId: number; score: number }[];
    }
  ) => {
    return await prisma.$transaction(async (tx) => {
      const test = await tx.pcesTest.update({
        where: { id: testId },
        data: {
          testDate: data.testDate,
          totalScore: new Prisma.Decimal(data.totalScore),
        },
      });

      await tx.pcesScore.deleteMany({
        where: { testId },
      });

      await Promise.all(
        data.scores.map((score) =>
          tx.pcesScore.create({
            data: {
              testId,
              sopItemId: score.sopItemId,
              score: score.score,
            },
          })
        )
      );

      return test;
    });
  },
};
