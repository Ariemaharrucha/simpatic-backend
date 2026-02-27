import prisma from "../utils/prisma";
import { PcesRepository } from "../repositories/pces.repository";
import { CourseRepository } from "../repositories/course.repository";
import { ClassRepository } from "../repositories/class.repository";
import { NotFoundError, ValidationError, ForbiddenError } from "../middleware/error.middleware";
import { Prisma } from "../generated/prisma/client";
import {
  ICreateTemplateRequest,
  ICreatePcesTestRequest,
  IPcesTemplateResponse,
  IPcesTemplateDetailResponse,
  IPcesTestResponse,
  IPcesTestDetailResponse,
  IPcesStudentResultResponse,
  ILecturerCourseResponse,
  ILecturerClassResponse,
  ILecturerStudentResponse,
} from "../types/pces.types";

export const PcesService = {
  createTemplate: async (data: ICreateTemplateRequest) => {
    if (!data.courseId) {
      throw new ValidationError("courseId is required");
    }

    const courseExists = await CourseRepository.exists(data.courseId);
    if (!courseExists) {
      throw new NotFoundError("Course not found");
    }

    if (!data.sopItems || data.sopItems.length === 0) {
      throw new ValidationError("Template must have at least 1 SOP item");
    }

    return await PcesRepository.createTemplate(data);
  },

  getAllTemplates: async (courseId?: number): Promise<IPcesTemplateResponse[]> => {
    const templates = await PcesRepository.findAllTemplates(courseId);

    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? undefined,
      course: {
        id: t.course.id,
        code: t.course.code,
        name: t.course.name,
      },
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
      course: {
        id: template.course.id,
        code: template.course.code,
        name: template.course.name,
      },
      sopItems: template.pcesSopItems.map((item) => ({
        id: item.id,
        sopDescription: item.sopDescription,
        orderNumber: item.orderNumber,
      })),
      createdAt: template.createdAt,
    };
  },

  getLecturerTemplates: async (
    lecturerId: number,
    courseId?: number
  ): Promise<IPcesTemplateResponse[]> => {
    const lecturerCourses = await prisma.lecturerCourse.findMany({
      where: { lecturerId },
      select: { courseId: true },
    });

    const courseIds = lecturerCourses.map((lc) => lc.courseId);

    if (courseIds.length === 0) {
      return [];
    }

    let filteredCourseIds = courseIds;
    if (courseId) {
      if (!courseIds.includes(courseId)) {
        throw new ForbiddenError("You are not assigned to this course");
      }
      filteredCourseIds = [courseId];
    }

    const templates = await PcesRepository.findTemplatesByCourses(filteredCourseIds);

    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? undefined,
      course: {
        id: t.course.id,
        code: t.course.code,
        name: t.course.name,
      },
      sopItemCount: t._count.pcesSopItems,
      createdAt: t.createdAt,
    }));
  },

  getLecturerCourses: async (lecturerId: number): Promise<ILecturerCourseResponse[]> => {
    const lecturerCourses = await prisma.lecturerCourse.findMany({
      where: { lecturerId },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        course: {
          name: "asc",
        },
      },
    });

    return lecturerCourses.map((lc) => ({
      id: lc.course.id,
      code: lc.course.code,
      name: lc.course.name,
    }));
  },

  getLecturerClasses: async (
    lecturerId: number,
    courseId: number
  ): Promise<ILecturerClassResponse[]> => {
    const isAssigned = await CourseRepository.isLecturerInCourse(courseId, lecturerId);
    if (!isAssigned) {
      throw new ForbiddenError("You are not assigned to this course");
    }

    return await PcesRepository.findClassesWithQuizzesByCourseWithStudentCount(courseId);
  },

  getLecturerStudents: async (
    lecturerId: number,
    classId: number
  ): Promise<ILecturerStudentResponse[]> => {
    const classExists = await ClassRepository.exists(classId);
    if (!classExists) {
      throw new NotFoundError("Class not found");
    }

    return await PcesRepository.findStudentsByClass(classId);
  },

  createPcesTest: async (
    data: ICreatePcesTestRequest,
    lecturerId: number
  ): Promise<IPcesTestDetailResponse> => {
    const template = await PcesRepository.findTemplateById(data.templateId);
    if (!template) {
      throw new NotFoundError("Template not found");
    }

    const isAssigned = await CourseRepository.isLecturerInCourse(
      template.courseId,
      lecturerId
    );
    if (!isAssigned) {
      throw new ForbiddenError("You are not assigned to this course");
    }

    const classExists = await ClassRepository.exists(data.classId);
    if (!classExists) {
      throw new NotFoundError("Class not found");
    }

    const isStudentInClass = await ClassRepository.isStudentInClass(
      data.classId,
      data.studentId
    );
    if (!isStudentInClass) {
      throw new ValidationError("Student is not in the selected class");
    }

    const existingTest = await PcesRepository.findTestByTemplateAndStudent(
      data.templateId,
      data.studentId
    );
    if (existingTest) {
      throw new ValidationError("Student already has a test for this template");
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
      courseId: template.courseId,
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
      course: {
        id: testDetail.course.id,
        code: testDetail.course.code,
        name: testDetail.course.name,
      },
      class: {
        id: testDetail.class.id,
        name: testDetail.class.name,
        academicYear: testDetail.class.academicYear,
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

  updatePcesTest: async (
    testId: number,
    data: ICreatePcesTestRequest,
    lecturerId: number
  ): Promise<IPcesTestDetailResponse> => {
    const test = await PcesRepository.findTestById(testId);
    if (!test) {
      throw new NotFoundError("Test not found");
    }

    const isAssigned = await CourseRepository.isLecturerInCourse(
      test.courseId,
      lecturerId
    );
    if (!isAssigned) {
      throw new ForbiddenError("You are not assigned to this course");
    }

    const template = await PcesRepository.findTemplateById(test.templateId);
    if (!template) {
      throw new NotFoundError("Template not found");
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

    await PcesRepository.updatePcesTest(testId, {
      testDate: new Date(data.testDate),
      totalScore,
      scores: data.scores,
    });

    const testDetail = await PcesRepository.findTestById(testId);
    if (!testDetail) {
      throw new NotFoundError("Test not found after update");
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
      course: {
        id: testDetail.course.id,
        code: testDetail.course.code,
        name: testDetail.course.name,
      },
      class: {
        id: testDetail.class.id,
        name: testDetail.class.name,
        academicYear: testDetail.class.academicYear,
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
      course: {
        id: t.course.id,
        code: t.course.code,
        name: t.course.name,
      },
      class: {
        id: t.class.id,
        name: t.class.name,
        academicYear: t.class.academicYear,
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
      course: {
        id: test.course.id,
        code: test.course.code,
        name: test.course.name,
      },
      class: {
        id: test.class.id,
        name: test.class.name,
        academicYear: test.class.academicYear,
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
      course: {
        id: t.course.id,
        code: t.course.code,
        name: t.course.name,
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
      courseName: test.course?.name,
      totalScore,
      isPassed: totalScore >= 60,
    };
  },
};
