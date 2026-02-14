import { Request, Response, NextFunction } from "express";
import { ResponseUtils } from "../utils/response.utils";

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

// Global error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", err);

  if (err instanceof ValidationError) {
    return ResponseUtils.error(res, err.message, 400);
  }

  if (err instanceof UnauthorizedError) {
    return ResponseUtils.error(res, err.message, 401);
  }

  if (err instanceof ForbiddenError) {
    return ResponseUtils.error(res, err.message, 403);
  }

  if (err instanceof NotFoundError) {
    return ResponseUtils.error(res, err.message, 404);
  }

  return ResponseUtils.internalError(
    res,
    err.message || "Internal server error",
  );
};
