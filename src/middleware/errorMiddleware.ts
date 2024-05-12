import { Request, Response, NextFunction } from "express";
import ResponseError from "../utils/ResponseError.js";

export const globalErrorMiddleware = (
  error: ResponseError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stackTrace: error.stack,
    error,
  });
};
