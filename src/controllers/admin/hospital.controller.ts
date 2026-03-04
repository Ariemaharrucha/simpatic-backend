import { Request, Response, NextFunction } from "express";
import { HospitalService } from "../../services/hospital.service";
import { ResponseUtils } from "../../utils/response.utils";
import { ICreateHospital, IUpdateHospital, IHospitalListQuery } from "../../types/hospital.types";

export const HospitalController = {
  handleCreateHospital: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: ICreateHospital = req.body;
      const hospital = await HospitalService.createHospital(data);
      return ResponseUtils.success(res, hospital, "Hospital created successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  handleGetHospitalById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const includeDeleted = req.query.includeDeleted === "true";
      const hospital = await HospitalService.getHospitalById(Number(id), includeDeleted);

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

      const result = await HospitalService.getAllHospitals(query);
      return ResponseUtils.success(res, result, "Hospitals retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  handleUpdateHospital: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data: IUpdateHospital = req.body;
      const hospital = await HospitalService.updateHospital(Number(id), data);
      return ResponseUtils.success(res, hospital, "Hospital updated successfully");
    } catch (error) {
      next(error);
    }
  },

  handleDeleteHospital: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await HospitalService.deleteHospital(Number(id));
      return ResponseUtils.success(res, null, "Hospital deleted successfully");
    } catch (error) {
      next(error);
    }
  },

  handleRestoreHospital: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const hospital = await HospitalService.restoreHospital(Number(id));
      return ResponseUtils.success(res, hospital, "Hospital restored successfully");
    } catch (error) {
      next(error);
    }
  },
};
