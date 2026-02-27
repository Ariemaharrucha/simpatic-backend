import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import { ResponseUtils } from "../utils/response.utils";

export const AdminController = {
  // Register new student
  handleRegisterStudent: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nim, name, email } = req.body;

      if (!nim || !name || !email) {
        return ResponseUtils.error(
          res,
          "NIM, name, and email are required",
          400,
        );
      }

      const result = await AdminService.registerStudent({
        nim,
        name,
        email,
      });

      const message = result.credentials.emailSent
        ? "Student registered successfully. Credentials sent to email."
        : "Student registered but email failed. Credentials shown in response.";

      return ResponseUtils.success(res, result, message, 201);
    } catch (error) {
      next(error);
    }
  },

  // Register new lecturer
  handleRegisterLecturer: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lecturerCode, name, email } = req.body;

      // Validation
      if (!lecturerCode || !name || !email) {
        return ResponseUtils.error(
          res,
          "Lecturer code, name, and email are required",
          400,
        );
      }

      const result = await AdminService.registerLecturer({
        lecturerCode,
        name,
        email,
      });

      const message = result.credentials.emailSent
        ? "Lecturer registered successfully. Credentials sent to email."
        : "Lecturer registered but email failed. Credentials shown in response.";

      return ResponseUtils.success(res, result, message, 201);
    } catch (error) {
      next(error);
    }
  },

  // Register new admin
  handleRegisterAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        return ResponseUtils.error(res, "Name and email are required", 400);
      }

      const result = await AdminService.registerAdmin({
        name,
        email,
      });

      const message = result.credentials.emailSent
        ? "Admin registered successfully. Credentials sent to email."
        : "Admin registered but email failed. Credentials shown in response.";

      return ResponseUtils.success(res, result, message, 201);
    } catch (error) {
      next(error);
    }
  },

  // Get all students
  getAllStudents: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await AdminService.getAllStudents(page, limit);

      return ResponseUtils.success(
        res,
        result,
        "Students retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  },

  // Get all lecturers
  getAllLecturers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await AdminService.getAllLecturers(page, limit);

      return ResponseUtils.success(
        res,
        result,
        "Lecturers retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  },

  // Get all admins
  getAllAdmins: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await AdminService.getAllAdmins(page, limit);

      return ResponseUtils.success(
        res,
        result,
        "Admins retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  },

  // Resend credentials to user
  handleResendCredentials: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIdParam = req.params.userId as string;
      const userId = parseInt(userIdParam);

      if (isNaN(userId)) {
        return ResponseUtils.error(res, "Valid userId is required", 400);
      }

      const result = await AdminService.resendCredentials(userId);

      const message = result.credentials.emailSent
        ? "New credentials sent to email successfully."
        : "Email failed. New credentials shown in response.";

      return ResponseUtils.success(res, result, message);
    } catch (error) {
      next(error);
    }
  },
};
