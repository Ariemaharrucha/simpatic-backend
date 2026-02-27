import { Request, Response, NextFunction } from "express";
import { ClassService } from "../../services/class.service";
import { ResponseUtils } from "../../utils/response.utils";
import { ICreateClassRequest, IUpdateClassRequest, IAssignStudentRequest } from "../../types/class.types";

export const ClassController = {
  // Create new class
  handleCreateClass: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, academicYear } = req.body;

      if (!name || !academicYear) {
        return ResponseUtils.error(res, "Name and academic year are required", 400);
      }

      const data: ICreateClassRequest = {
        name: name.trim(),
        academicYear: academicYear.trim(),
      };

      const result = await ClassService.createClass(data);
      return ResponseUtils.success(res, result, "Class created successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  // Get all classes
  handleGetAllClasses: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const academicYear = typeof req.query.academicYear === "string" ? req.query.academicYear : undefined;
      const includeInactive = req.query.includeInactive === "true";

      const result = await ClassService.getAllClasses(page, limit, academicYear, includeInactive);
      return ResponseUtils.success(res, result, "Classes retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  // Get class by ID
  handleGetClassById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return ResponseUtils.error(res, "Valid class ID is required", 400);
      }

      const result = await ClassService.getClassById(id);
      return ResponseUtils.success(res, result, "Class retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  // Update class
  handleUpdateClass: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return ResponseUtils.error(res, "Valid class ID is required", 400);
      }

      const { name, academicYear } = req.body;

      if (!name && !academicYear) {
        return ResponseUtils.error(res, "At least one field (name or academicYear) is required", 400);
      }

      const data: IUpdateClassRequest = {};
      if (name !== undefined) data.name = name.trim();
      if (academicYear !== undefined) data.academicYear = academicYear.trim();

      const result = await ClassService.updateClass(id, data);
      return ResponseUtils.success(res, result, "Class updated successfully");
    } catch (error) {
      next(error);
    }
  },

  // Soft delete class
  handleDeleteClass: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return ResponseUtils.error(res, "Valid class ID is required", 400);
      }

      const result = await ClassService.deleteClass(id);
      return ResponseUtils.success(res, result, "Class deleted successfully");
    } catch (error) {
      next(error);
    }
  },

  // Restore soft deleted class
  handleRestoreClass: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return ResponseUtils.error(res, "Valid class ID is required", 400);
      }

      const result = await ClassService.restoreClass(id);
      return ResponseUtils.success(res, result, "Class restored successfully");
    } catch (error) {
      next(error);
    }
  },

  // Get students in class
  handleGetStudents: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return ResponseUtils.error(res, "Valid class ID is required", 400);
      }

      const result = await ClassService.getStudents(id);
      return ResponseUtils.success(res, result, "Students retrieved successfully");
    } catch (error) {
      next(error);
    }
  },

  // Assign student to class
  handleAssignStudent: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const classId = parseInt(req.params.id as string);
      const { studentId } = req.body;

      if (isNaN(classId)) {
        return ResponseUtils.error(res, "Valid class ID is required", 400);
      }

      if (!studentId || isNaN(parseInt(studentId))) {
        return ResponseUtils.error(res, "Valid studentId is required", 400);
      }

      const data: IAssignStudentRequest = {
        studentId: parseInt(studentId),
      };

      const result = await ClassService.assignStudent(classId, data);
      return ResponseUtils.success(res, result, "Student assigned to class successfully", 201);
    } catch (error) {
      next(error);
    }
  },

  // Remove student from class
  handleRemoveStudent: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const classId = parseInt(req.params.id as string);
      const studentId = parseInt(req.params.studentId as string);

      if (isNaN(classId)) {
        return ResponseUtils.error(res, "Valid class ID is required", 400);
      }

      if (isNaN(studentId)) {
        return ResponseUtils.error(res, "Valid studentId is required", 400);
      }

      await ClassService.removeStudent(classId, studentId);
      return ResponseUtils.success(res, null, "Student removed from class successfully");
    } catch (error) {
      next(error);
    }
  },

  // Get available students (not assigned to any class in academic year)
  handleGetAvailableStudents: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const academicYear = typeof req.query.academicYear === "string" ? req.query.academicYear : "";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!academicYear) {
        return ResponseUtils.error(res, "academicYear query parameter is required", 400);
      }

      const result = await ClassService.getAvailableStudents(academicYear, page, limit);
      return ResponseUtils.success(res, result, "Available students retrieved successfully");
    } catch (error) {
      next(error);
    }
  },
};
