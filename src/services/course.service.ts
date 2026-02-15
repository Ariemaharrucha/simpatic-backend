import { CourseRepository } from "../repositories/course.repository";
import {
  ICourse,
  ICreateCourseRequest,
  IUpdateCourseRequest,
  ICourseWithLecturers,
  IAssignLecturerRequest,
  IAvailableLecturer,
  ICourseLecturer,
  ILecturerWithUser
} from "../types/course.types";
import { ValidationError, NotFoundError } from "../middleware/error.middleware";

export const CourseService = {
  // Create new course
  createCourse: async (data: ICreateCourseRequest): Promise<ICourse> => {
    if (!data.code || data.code.trim().length === 0) {
      throw new ValidationError("Course code is required");
    }

    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError("Course name is required");
    }

    // Check for duplicate code
    const existingCourse = await CourseRepository.findByCode(data.code.trim());

    if (existingCourse) {
      throw new ValidationError(
        `Course with code "${data.code}" already exists`
      );
    }

    return await CourseRepository.create(data);
  },

  // Get all courses
  getAllCourses: async (
    page: number = 1, 
    limit: number = 10,
    includeInactive: boolean = false
  ): Promise<{ courses: ICourse[]; total: number; page: number; limit: number }> => {
    return await CourseRepository.findAll(page, limit, includeInactive);
  },

  // Get course by ID
  getCourseById: async (id: number): Promise<ICourseWithLecturers> => {
    const courseData = await CourseRepository.findByIdWithLecturers(id);
    
    if (!courseData) {
      throw new NotFoundError("Course not found");
    }

    return courseData;
  },

  // Update course
  updateCourse: async (id: number, data: IUpdateCourseRequest): Promise<ICourse> => {
    const exists = await CourseRepository.exists(id);
    if (!exists) {
      throw new NotFoundError("Course not found");
    }

    // If code is being updated, check for duplicates
    if (data.code) {
      const existingCourse = await CourseRepository.findByCode(data.code.trim());
      if (existingCourse && existingCourse.id !== id) {
        throw new ValidationError(
          `Course with code "${data.code}" already exists`
        );
      }
    }

    if (data.code !== undefined && data.code.trim().length === 0) {
      throw new ValidationError("Course code cannot be empty");
    }

    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new ValidationError("Course name cannot be empty");
    }

    return await CourseRepository.update(id, data);
  },

  // Soft delete course
  deleteCourse: async (id: number): Promise<ICourse> => {
    const exists = await CourseRepository.exists(id);
    if (!exists) {
      throw new NotFoundError("Course not found");
    }

    return await CourseRepository.softDelete(id);
  },

  // Restore soft deleted course
  restoreCourse: async (id: number): Promise<ICourse> => {
    const exists = await CourseRepository.exists(id);
    if (!exists) {
      throw new NotFoundError("Course not found");
    }

    return await CourseRepository.restore(id);
  },

  // Assign lecturer to course
  assignLecturer: async (courseId: number, data: IAssignLecturerRequest): Promise<any> => {
    const { lecturerId } = data;

    // Check if course exists and is active
    const courseData = await CourseRepository.findById(courseId);
    if (!courseData) {
      throw new NotFoundError("Course not found");
    }

    if (courseData.status !== "active" || courseData.deletedAt) {
      throw new ValidationError("Cannot assign lecturer to inactive or deleted course");
    }

    // Check if lecturer exists
    const lecturerData = await CourseRepository.findLecturerById(lecturerId);
    if (!lecturerData) {
      throw new NotFoundError("Lecturer not found");
    }

    // Check if lecturer user is active
    if (lecturerData.user.status !== "active") {
      throw new ValidationError("Cannot assign inactive lecturer to course");
    }

    // Check if lecturer already in this course
    const isAlreadyInCourse = await CourseRepository.isLecturerInCourse(courseId, lecturerId);
    if (isAlreadyInCourse) {
      throw new ValidationError("Lecturer is already assigned to this course");
    }

    return await CourseRepository.assignLecturer(courseId, lecturerId);
  },

  // Remove lecturer from course
  removeLecturer: async (courseId: number, lecturerId: number): Promise<void> => {
    const exists = await CourseRepository.exists(courseId);
    if (!exists) {
      throw new NotFoundError("Course not found");
    }

    // Check if lecturer exists
    const lecturerData = await CourseRepository.findLecturerById(lecturerId);
    if (!lecturerData) {
      throw new NotFoundError("Lecturer not found");
    }

    // Check if lecturer is in course
    const isInCourse = await CourseRepository.isLecturerInCourse(courseId, lecturerId);
    if (!isInCourse) {
      throw new ValidationError("Lecturer is not assigned to this course");
    }

    await CourseRepository.removeLecturer(courseId, lecturerId);
  },

  // Get lecturers in course
  getLecturers: async (courseId: number): Promise<ICourseLecturer[]> => {
    const exists = await CourseRepository.exists(courseId);
    if (!exists) {
      throw new NotFoundError("Course not found");
    }

    return await CourseRepository.getLecturers(courseId);
  },

  // Get available lecturers (not assigned to specific course)
  getAvailableLecturers: async (
    courseId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ lecturers: IAvailableLecturer[]; total: number; page: number; limit: number }> => {
    const exists = await CourseRepository.exists(courseId);
    if (!exists) {
      throw new NotFoundError("Course not found");
    }

    return await CourseRepository.getAvailableLecturers(courseId, page, limit);
  },
};
