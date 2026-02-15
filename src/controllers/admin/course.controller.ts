import { Request, Response, NextFunction } from "express";
import { CourseService } from "../../services/course.service";
import { ResponseUtils } from "../../utils/response.utils";
import { ICreateCourseRequest, IUpdateCourseRequest, IAssignLecturerRequest } from "../../types/course.types";

export const CourseController = {
  // Create new course
  handleCreateCourse: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, name } = req.body;

      if (!code || !name) {
        return ResponseUtils.error(res, "Code and name are required", 400);
      }

      const data: ICreateCourseRequest = {
        code: code.trim(),
        name: name.trim(),
      };

      const result = await CourseService.createCourse(data);
      return ResponseUtils.success(res, result, "Course created successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  // Get all courses
  handleGetAllCourses: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const includeInactive = req.query.includeInactive === "true";

      const result = await CourseService.getAllCourses(page, limit, includeInactive);
      return ResponseUtils.success(res, result, "Courses retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  // Get course by ID
  handleGetCourseById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return ResponseUtils.error(res, "Valid course ID is required", 400);
      }

      const result = await CourseService.getCourseById(id);
      return ResponseUtils.success(res, result, "Course retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  // Update course
  handleUpdateCourse: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return ResponseUtils.error(res, "Valid course ID is required", 400);
      }

      const { code, name } = req.body;

      if (!code && !name) {
        return ResponseUtils.error(res, "At least one field (code or name) is required", 400);
      }

      const data: IUpdateCourseRequest = {};
      if (code !== undefined) data.code = code.trim();
      if (name !== undefined) data.name = name.trim();

      const result = await CourseService.updateCourse(id, data);
      return ResponseUtils.success(res, result, "Course updated successfully");
    } catch (error) {
      next(error);
    }
  },

  // Soft delete course
  handleDeleteCourse: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return ResponseUtils.error(res, "Valid course ID is required", 400);
      }

      const result = await CourseService.deleteCourse(id);
      return ResponseUtils.success(res, result, "Course deleted successfully");
    } catch (error) {
      next(error);
    }
  },

  // Restore soft deleted course
  handleRestoreCourse: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return ResponseUtils.error(res, "Valid course ID is required", 400);
      }

      const result = await CourseService.restoreCourse(id);
      return ResponseUtils.success(res, result, "Course restored successfully");
    } catch (error) {
      next(error);
    }
  },

  // Get lecturers in course
  handleGetLecturers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return ResponseUtils.error(res, "Valid course ID is required", 400);
      }

      const result = await CourseService.getLecturers(id);
      return ResponseUtils.success(res, result, "Lecturers retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  // Assign lecturer to course
  handleAssignLecturer: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = parseInt(req.params.id as string);
      const { lecturerId } = req.body;

      if (isNaN(courseId)) {
        return ResponseUtils.error(res, "Valid course ID is required", 400);
      }

      if (!lecturerId || isNaN(parseInt(lecturerId))) {
        return ResponseUtils.error(res, "Valid lecturerId is required", 400);
      }

      const data: IAssignLecturerRequest = {
        lecturerId: parseInt(lecturerId),
      };

      const result = await CourseService.assignLecturer(courseId, data);
      return ResponseUtils.success(res, result, "Lecturer assigned to course successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  // Remove lecturer from course
  handleRemoveLecturer: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = parseInt(req.params.id as string);
      const lecturerId = parseInt(req.params.lecturerId as string);

      if (isNaN(courseId)) {
        return ResponseUtils.error(res, "Valid course ID is required", 400);
      }

      if (isNaN(lecturerId)) {
        return ResponseUtils.error(res, "Valid lecturerId is required", 400);
      }

      await CourseService.removeLecturer(courseId, lecturerId);
      return ResponseUtils.success(res, null, "Lecturer removed from course successfully");
    } catch (error) {
      next(error);
    }
  },

  // Get available lecturers (not assigned to specific course)
  handleGetAvailableLecturers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = parseInt(req.params.id as string);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (isNaN(courseId)) {
        return ResponseUtils.error(res, "Valid course ID is required", 400);
      }

      const result = await CourseService.getAvailableLecturers(courseId, page, limit);
      return ResponseUtils.success(res, result, "Available lecturers retrieved successfully");
    } catch (error) {
      next(error);
    }
  },
};
