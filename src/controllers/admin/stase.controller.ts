import { Request, Response, NextFunction } from "express";
import { StaseService } from "../../services/stase.service";
import { ResponseUtils } from "../../utils/response.utils";
import { ICreateStase, IUpdateStase, IStaseListQuery } from "../../types/stase.types";

export const StaseController = {
  handleCreateStase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: ICreateStase = req.body;
      const stase = await StaseService.createStase(data);
      return ResponseUtils.success(res, stase, "Stase created successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  handleGetStaseById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const includeDeleted = req.query.includeDeleted === "true";
      const stase = await StaseService.getStaseById(Number(id), includeDeleted);

      if (!stase) {
        return ResponseUtils.error(res, "Stase not found", 404);
      }

      return ResponseUtils.success(res, stase, "Stase retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetAllStases: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: IStaseListQuery = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        search: req.query.search as string,
        includeDeleted: req.query.includeDeleted === "true",
      };

      const result = await StaseService.getAllStases(query);
      return ResponseUtils.success(res, result, "Stases retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleUpdateStase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data: IUpdateStase = req.body;
      const stase = await StaseService.updateStase(Number(id), data);
      return ResponseUtils.success(res, stase, "Stase updated successfully");
    } catch (error) {
      next(error);
    }
  },

  handleDeleteStase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await StaseService.deleteStase(Number(id));
      return ResponseUtils.success(res, null, "Stase deleted successfully");
    } catch (error) {
      next(error);
    }
  },

  handleRestoreStase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const stase = await StaseService.restoreStase(Number(id));
      return ResponseUtils.success(res, stase, "Stase restored successfully");
    } catch (error) {
      next(error);
    }
  },
};
