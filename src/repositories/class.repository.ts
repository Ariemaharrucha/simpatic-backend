import prisma from "../utils/prisma";
import { IClass, ICreateClassRequest, IUpdateClassRequest, IClassWithStudents, IAvailableStudent } from "../types/class.types";

export const ClassRepository = {
  // Create new class
  create: async (data: ICreateClassRequest): Promise<IClass> => {
    return await prisma.class.create({
      data: {
        name: data.name,
        academicYear: data.academicYear,
        status: "active",
      },
    });
  },

  // Find all classes with pagination
  findAll: async (
    page: number = 1,
    limit: number = 10,
    academicYear?: string,
    includeInactive: boolean = false
  ): Promise<{ classes: IClass[]; total: number; page: number; limit: number }> => {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (!includeInactive) {
      where.status = "active";
      where.deletedAt = null;
    }
    
    if (academicYear) {
      where.academicYear = academicYear;
    }

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.class.count({ where }),
    ]);

    return { classes, total, page, limit };
  },

  // Find class by ID (class info only)
  findById: async (id: number): Promise<IClass | null> => {
    return await prisma.class.findUnique({
      where: { id },
    });
  },

  // Find class with students
  findByIdWithStudents: async (id: number): Promise<IClassWithStudents | null> => {
    // Get class info
    const classInfo = await prisma.class.findUnique({
      where: { id },
    });

    if (!classInfo) {
      return null;
    }

    // Get students in this class
    const classStudents = await prisma.classStudent.findMany({
      where: { classId: id },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // Combine results
    return {
      ...classInfo,
      classStudents,
    };
  },

  // Find class by academic year
  findByAcademicYear: async (academicYear: string): Promise<IClass[]> => {
    return await prisma.class.findMany({
      where: {
        academicYear,
        status: "active",
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  // Find class by name and academic year (for duplicate check)
  findByNameAndAcademicYear: async (
    name: string,
    academicYear: string
  ): Promise<IClass | null> => {
    return await prisma.class.findFirst({
      where: {
        name,
        academicYear,
      },
    });
  },

  // Update class
  update: async (id: number, data: IUpdateClassRequest): Promise<IClass> => {
    return await prisma.class.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.academicYear && { academicYear: data.academicYear }),
      },
    });
  },

  // Soft delete class
  softDelete: async (id: number): Promise<IClass> => {
    return await prisma.class.update({
      where: { id },
      data: {
        status: "inactive",
        deletedAt: new Date(),
      },
    });
  },

  // Restore soft deleted class
  restore: async (id: number): Promise<IClass> => {
    return await prisma.class.update({
      where: { id },
      data: {
        status: "active",
        deletedAt: null,
      },
    });
  },

  // Check if class exists
  exists: async (id: number): Promise<boolean> => {
    const count = await prisma.class.count({
      where: { id },
    });
    return count > 0;
  },

  // Assign student to class
  assignStudent: async (classId: number, studentId: number) => {
    return await prisma.classStudent.create({
      data: {
        classId,
        studentId,
      },
    });
  },

  // Remove student from class
  removeStudent: async (classId: number, studentId: number) => {
    return await prisma.classStudent.deleteMany({
      where: {
        classId,
        studentId,
      },
    });
  },

  // Get students in class (separate query for readability)
  getStudents: async (classId: number) => {
    const classStudents = await prisma.classStudent.findMany({
      where: { classId },
      include: {
        student: {
          select: {
            id: true,
            nim: true,
            name: true,
            user: {
              select: {
                id: true,
                email: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // flat structure for cleaner response
    return classStudents.map((cs) => ({
      classStudentId: cs.id,
      studentId: cs.student.id,
      nim: cs.student.nim,
      name: cs.student.name,
      email: cs.student.user.email,
      userStatus: cs.student.user.status,
      assignedAt: cs.createdAt,
    }));
  },

  // Check if student already assigned to any class in academic year
  findStudentClassByAcademicYear: async (
    studentId: number,
    academicYear: string
  ): Promise<any | null> => {
    return await prisma.classStudent.findFirst({
      where: {
        studentId,
        class: {
          academicYear,
        },
      },
      include: {
        class: true,
      },
    });
  },

  // Get available students (not assigned to any class in academic year)
  getAvailableStudents: async (
    academicYear: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ students: IAvailableStudent[]; total: number; page: number; limit: number }> => {
    const skip = (page - 1) * limit;

    // Get all student IDs already assigned to classes in this academic year
    const assignedStudentIds = await prisma.classStudent.findMany({
      where: {
        class: {
          academicYear,
        },
      },
      select: {
        studentId: true,
      },
    });

    const assignedIds = assignedStudentIds.map((item) => item.studentId);

    // Get students not in the assigned list
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: {
          id: {
            notIn: assignedIds.length > 0 ? assignedIds : [-1],
          },
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.student.count({
        where: {
          id: {
            notIn: assignedIds.length > 0 ? assignedIds : [-1],
          },
        },
      }),
    ]);

    return { students, total, page, limit };
  },

  // Check if student is assigned to specific class
  isStudentInClass: async (classId: number, studentId: number): Promise<boolean> => {
    const count = await prisma.classStudent.count({
      where: {
        classId,
        studentId,
      },
    });
    return count > 0;
  },
};
