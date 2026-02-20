import prisma from "../utils/prisma";
import { UserRole } from "../types/user.types";

export const UserRepository = {
  // Create user (base)
  create: async (data: { email: string; password: string; role: UserRole }) => {
    return await prisma.user.create({
      data,
    });
  },

  // Find user by email
  findByEmail: async (email: string) => {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        admin: true,
        lecturer: true,
        student: true,
      },
    });
  },

  // Find user by ID
  findById: async (id: number) => {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        admin: true,
        lecturer: true,
        student: true,
      },
    });
  },

  // login mahasiswa
  findStudentByNIM: async (nim: string) => {
    return await prisma.student.findUnique({
      where: { nim },
      include: {
        user: true,
      },
    });
  },

  // login dosen by lecturer code (NIK)
  findLecturerByCode: async (lecturerCode: string) => {
    return await prisma.lecturer.findUnique({
      where: { lecturerCode },
      include: {
        user: true,
      },
    });
  },

  // update password
  updatePassword: async (userId: number, newPassword: string) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  },

  // Check if email exists
  isEmailExists: async (email: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return !!user;
  },

  // Check if NIM exists
  isNIMExists: async (nim: string): Promise<boolean> => {
    const student = await prisma.student.findUnique({
      where: { nim },
    });
    return !!student;
  },

  // Check if lecturer code exists
  isLecturerCodeExists: async (lecturerCode: string): Promise<boolean> => {
    const lecturer = await prisma.lecturer.findUnique({
      where: { lecturerCode },
    });
    return !!lecturer;
  },

  // Check if student exists by ID
  studentExists: async (studentId: number): Promise<boolean> => {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    return !!student;
  },

  // Create student with user (transaction)
  createStudent: async (data: {
    email: string;
    password: string;
    nim: string;
    name: string;
  }) => {
    return await prisma.$transaction(async (tx) => {
      // Create user first
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: data.password,
          role: UserRole.STUDENT,
        },
      });

      // Create student profile
      const student = await tx.student.create({
        data: {
          userId: user.id,
          nim: data.nim,
          name: data.name,
        },
      });

      return { user, student };
    });
  },

  // Create lecturer with user (transaction)
  createLecturer: async (data: {
    email: string;
    password: string;
    lecturerCode: string;
    name: string;
  }) => {
    return await prisma.$transaction(async (tx) => {
      // Create user first
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: data.password,
          role: UserRole.LECTURER,
        },
      });

      // Create lecturer profile
      const lecturer = await tx.lecturer.create({
        data: {
          userId: user.id,
          lecturerCode: data.lecturerCode,
          name: data.name,
        },
      });

      return { user, lecturer };
    });
  },

  // Create admin with user (transaction)
  createAdmin: async (data: {
    email: string;
    password: string;
    name: string;
  }) => {
    return await prisma.$transaction(async (tx) => {
      // Create user first
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: data.password,
          role: UserRole.ADMIN,
        },
      });

      // Create admin profile
      const admin = await tx.admin.create({
        data: {
          userId: user.id,
          name: data.name,
        },
      });

      return { user, admin };
    });
  },

  // List all students with pagination
  findAllStudents: async (page: number = 1, limit: number = 10) => {
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

  // List all lecturers with pagination
  findAllLecturers: async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const [lecturers, total] = await Promise.all([
      prisma.lecturer.findMany({
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
      prisma.lecturer.count(),
    ]);

    return { lecturers, total, page, limit };
  },

  // List all admins with pagination
  findAllAdmins: async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      prisma.admin.findMany({
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
      prisma.admin.count(),
    ]);

    return { admins, total, page, limit };
  },
};
