import { Request, Response, NextFunction } from "express";

interface AsyncHandler {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}

export const asyncErrorHandler = (
  func: AsyncHandler
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req, res, next) => {
    func(req, res, next).catch((err) => next(err));
  };
};
