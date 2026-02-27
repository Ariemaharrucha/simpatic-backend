import { Response } from "express";

export const ResponseUtils = {
  // Standard success response
  success: <T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode = 200
  ) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  // Standard error response
  error: (res: Response, message: string, statusCode = 400) => {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
    });
  },

  // Common HTTP status helpers
  unauthorized: (res: Response, message = "Unauthorized") => {
    return ResponseUtils.error(res, message, 401);
  },

  forbidden: (res: Response, message = "Forbidden") => {
    return ResponseUtils.error(res, message, 403);
  },

  notFound: (res: Response, message = "Not found") => {
    return ResponseUtils.error(res, message, 404);
  },

  internalError: (res: Response, message = "Internal server error") => {
    return ResponseUtils.error(res, message, 500);
  },
};
