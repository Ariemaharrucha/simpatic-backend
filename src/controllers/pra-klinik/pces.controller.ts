import { Response, NextFunction } from "express";
import { PcesService } from "../../services/pces.service";
import { ResponseUtils } from "../../utils/response.utils";
import { AuthRequest } from "../../middleware/auth.middleware";
import { ValidationError } from "../../middleware/error.middleware";

export const PcesController = {
  handleCreateTemplate: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const template = await PcesService.createTemplate(req.body);
      return ResponseUtils.success(
        res,
        { template },
        "Template created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  },

  handleGetAllTemplates: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const courseId = req.query.courseId ? parseInt(req.query.courseId as string) : undefined;
      const templates = await PcesService.getAllTemplates(courseId);
      return ResponseUtils.success(res, { templates }, "Templates retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetTemplateDetail: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const templateId = parseInt(req.params.id as string);
      const template = await PcesService.getTemplateDetail(templateId);
      return ResponseUtils.success(res, { template }, "Template retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetLecturerCourses: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const courses = await PcesService.getLecturerCourses(lecturerId);
      return ResponseUtils.success(res, { courses }, "Courses retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetLecturerTemplates: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const courseId = req.query.courseId ? parseInt(req.query.courseId as string) : undefined;
      const templates = await PcesService.getLecturerTemplates(lecturerId, courseId);
      return ResponseUtils.success(res, { templates }, "Templates retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetLecturerClasses: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const courseId = parseInt(req.query.courseId as string);
      if (!courseId) {
        throw new ValidationError("courseId is required");
      }

      const classes = await PcesService.getLecturerClasses(lecturerId, courseId);
      return ResponseUtils.success(res, { classes }, "Classes retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetLecturerStudents: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const classId = parseInt(req.query.classId as string);
      if (!classId) {
        throw new ValidationError("classId is required");
      }

      const students = await PcesService.getLecturerStudents(lecturerId, classId);
      return ResponseUtils.success(res, { students }, "Students retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleCreatePcesTest: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const test = await PcesService.createPcesTest(req.body, lecturerId);
      return ResponseUtils.success(res, { test }, "PCES test created successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  handleUpdatePcesTest: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const testId = parseInt(req.params.id as string);
      const test = await PcesService.updatePcesTest(testId, req.body, lecturerId);
      return ResponseUtils.success(res, { test }, "PCES test updated successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetLecturerTests: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const tests = await PcesService.getLecturerTests(lecturerId);
      return ResponseUtils.success(res, { tests }, "Tests retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetTestDetail: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const lecturerId = req.user?.profileId;
      if (!lecturerId) {
        return ResponseUtils.unauthorized(res);
      }

      const testId = parseInt(req.params.id as string);
      const test = await PcesService.getTestDetail(testId, lecturerId);
      return ResponseUtils.success(res, { test }, "Test retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetMyResults: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const studentId = req.user?.profileId;
      if (!studentId) {
        return ResponseUtils.unauthorized(res);
      }

      const results = await PcesService.getStudentResults(studentId);
      return ResponseUtils.success(res, { results }, "Results retrieved successfully");
    } catch (error) {
      next(error);
    }
  },
};
