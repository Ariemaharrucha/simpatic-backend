import { Request, Response, NextFunction } from "express";
import { MasterService } from "../../services/master.service";
import { ResponseUtils } from "../../utils/response.utils";
import { ICreateHospitalDTO, IUpdateHospitalDTO, IHospitalListQuery } from "../../types/hospital.types";
import { ICreateStaseDTO, IUpdateStaseDTO, IStaseListQuery } from "../../types/stase.types";

export const MasterController = {
  handleCreateHospital: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: ICreateHospitalDTO = req.body;
      const hospital = await MasterService.createHospital(data);
      return ResponseUtils.success(res, hospital, "Hospital created successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  handleGetHospitalById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const includeDeleted = req.query.includeDeleted === "true";
      const hospital = await MasterService.getHospitalById(Number(id), includeDeleted);

      if (!hospital) {
        return ResponseUtils.error(res, "Hospital not found", 404);
      }

      return ResponseUtils.success(res, hospital, "Hospital retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleGetAllHospitals: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: IHospitalListQuery = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        search: req.query.search as string,
        includeDeleted: req.query.includeDeleted === "true",
      };

      const result = await MasterService.getAllHospitals(query);
      return ResponseUtils.success(res, result, "Hospitals retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleUpdateHospital: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data: IUpdateHospitalDTO = req.body;
      const hospital = await MasterService.updateHospital(Number(id), data);
      return ResponseUtils.success(res, hospital, "Hospital updated successfully");
    } catch (error) {
      next(error);
    }
  },

  handleDeleteHospital: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await MasterService.deleteHospital(Number(id));
      return ResponseUtils.success(res, null, "Hospital deleted successfully");
    } catch (error) {
      next(error);
    }
  },

  handleRestoreHospital: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const hospital = await MasterService.restoreHospital(Number(id));
      return ResponseUtils.success(res, hospital, "Hospital restored successfully");
    } catch (error) {
      next(error);
    }
  },

  handleCreateStase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: ICreateStaseDTO = req.body;
      const stase = await MasterService.createStase(data);
      return ResponseUtils.success(res, stase, "Stase created successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  handleGetStaseById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const includeDeleted = req.query.includeDeleted === "true";
      const stase = await MasterService.getStaseById(Number(id), includeDeleted);

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

      const result = await MasterService.getAllStases(query);
      return ResponseUtils.success(res, result, "Stases retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleUpdateStase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data: IUpdateStaseDTO = req.body;
      const stase = await MasterService.updateStase(Number(id), data);
      return ResponseUtils.success(res, stase, "Stase updated successfully");
    } catch (error) {
      next(error);
    }
  },

  handleDeleteStase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await MasterService.deleteStase(Number(id));
      return ResponseUtils.success(res, null, "Stase deleted successfully");
    } catch (error) {
      next(error);
    }
  },

  handleRestoreStase: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const stase = await MasterService.restoreStase(Number(id));
      return ResponseUtils.success(res, stase, "Stase restored successfully");
    } catch (error) {
      next(error);
    }
  },
};
