import { Request, Response, NextFunction } from "express";
import { PcesService } from "../../services/pces.service";
import { ResponseUtils } from "../../utils/response.utils";
import { AuthRequest } from "../../middleware/auth.middleware";

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
      const templates = await PcesService.getAllTemplates();
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
