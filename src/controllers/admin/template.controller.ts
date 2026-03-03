import { Request, Response, NextFunction } from "express";
import { TemplateService } from "../../services/template.service";
import { ResponseUtils } from "../../utils/response.utils";

export const TemplateController = {
  handleGetTemplates: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templates = await TemplateService.getAvailableTemplates();
      return ResponseUtils.success(res, templates, "Templates retrieved successfully");
    } catch (error) {
      next(error);
    }
  },
};
