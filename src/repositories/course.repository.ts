import prisma from "../utils/prisma";
import { ICourse, ICreateCourseRequest, IUpdateCourseRequest, ICourseWithLecturers, IAvailableLecturer, ILecturerWithUser } from "../types/course.types";

export const CourseRepository = {
  // Create new course
  create: async (data: ICreateCourseRequest): Promise<ICourse> => {
    return await prisma.course.create({
      data: {
        code: data.code,
        name: data.name,
        status: "active",
      },
    });
  },

  // Find all courses with pagination
  findAll: async (
    page: number = 1,
    limit: number = 10,
    includeInactive: boolean = false
  ): Promise<{ courses: ICourse[]; total: number; page: number; limit: number }> => {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (!includeInactive) {
      where.status = "active";
      where.deletedAt = null;
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, total, page, limit };
  },

  // Find course by ID (course info only)
  findById: async (id: number): Promise<ICourse | null> => {
    return await prisma.course.findUnique({
      where: { id },
    });
  },

  // Find course with lecturers (using separate queries for readability)
  findByIdWithLecturers: async (id: number): Promise<ICourseWithLecturers | null> => {
    // Get course info
    const courseInfo = await prisma.course.findUnique({
      where: { id },
    });

    if (!courseInfo) {
      return null;
    }

    // Get lecturers in this course
    const lecturerCourses = await prisma.lecturerCourse.findMany({
      where: { courseId: id },
      include: {
        lecturer: {
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
      orderBy: {
        lecturer: {
          name: "asc",
        },
      },
    });

    // Combine results
    return {
      ...courseInfo,
      lecturerCourses,
    };
  },

  // Find course by code
  findByCode: async (code: string): Promise<ICourse | null> => {
    return await prisma.course.findUnique({
      where: { code },
    });
  },

  // find lecturer by id
  findLecturerById: async (lecturerId:number): Promise<ILecturerWithUser | null> => {
    return await prisma.lecturer.findUnique({
      where: {id: lecturerId},
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true
           }
        }
      }
    })
  },

  // Update course
  update: async (id: number, data: IUpdateCourseRequest): Promise<ICourse> => {
    return await prisma.course.update({
      where: { id },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.name && { name: data.name }),
      },
    });
  },

  // Soft delete course
  softDelete: async (id: number): Promise<ICourse> => {
    return await prisma.course.update({
      where: { id },
      data: {
        status: "inactive",
        deletedAt: new Date(),
      },
    });
  },

  // Restore soft deleted course
  restore: async (id: number): Promise<ICourse> => {
    return await prisma.course.update({
      where: { id },
      data: {
        status: "active",
        deletedAt: null,
      },
    });
  },

  // Check if course exists
  exists: async (id: number): Promise<boolean> => {
    const count = await prisma.course.count({
      where: { id },
    });
    return count > 0;
  },

  // Assign lecturer to course
  assignLecturer: async (courseId: number, lecturerId: number) => {
    return await prisma.lecturerCourse.create({
      data: {
        courseId,
        lecturerId,
      },
    });
  },

  // Remove lecturer from course
  removeLecturer: async (courseId: number, lecturerId: number) => {
    return await prisma.lecturerCourse.deleteMany({
      where: {
        courseId,
        lecturerId,
      },
    });
  },

  // Get lecturers in course (separate query for readability)
  getLecturers: async (courseId: number) => {
    const lecturerCourses = await prisma.lecturerCourse.findMany({
      where: { courseId },
      include: {
        lecturer: {
          select: {
            id: true,
            lecturerCode: true,
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
      orderBy: {
        lecturer: {
          name: "asc",
        },
      },
    });

    // Transform to flat structure for cleaner response
    return lecturerCourses.map((lc) => ({
      lecturerCourseId: lc.id,
      lecturerId: lc.lecturer.id,
      lecturerCode: lc.lecturer.lecturerCode,
      name: lc.lecturer.name,
      email: lc.lecturer.user.email,
      userStatus: lc.lecturer.user.status,
      assignedAt: lc.createdAt,
    }));
  },

  // Check if lecturer is assigned to specific course
  isLecturerInCourse: async (courseId: number, lecturerId: number): Promise<boolean> => {
    const count = await prisma.lecturerCourse.count({
      where: {
        courseId,
        lecturerId,
      },
    });
    return count > 0;
  },

  // Get available lecturers (not assigned to specific course)
  getAvailableLecturers: async (
    courseId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ lecturers: IAvailableLecturer[]; total: number; page: number; limit: number }> => {
    const skip = (page - 1) * limit;

    // Get all lecturer IDs already assigned to this course
    const assignedLecturerIds = await prisma.lecturerCourse.findMany({
      where: {
        courseId,
      },
      select: {
        lecturerId: true,
      },
    });

    const assignedIds = assignedLecturerIds.map((item) => item.lecturerId);

    // Get lecturers not in the assigned list
    const [lecturers, total] = await Promise.all([
      prisma.lecturer.findMany({
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
      prisma.lecturer.count({
        where: {
          id: {
            notIn: assignedIds.length > 0 ? assignedIds : [-1],
          },
        },
      }),
    ]);

    return { lecturers, total, page, limit };
  },
};
