import { Request, Response, NextFunction } from "express";

interface AsyncHandler {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}

export default class AsyncErrorHandler {
  static wrapper(
    func: AsyncHandler
  ): (req: Request, res: Response, next: NextFunction) => void {
    return (req, res, next) => {
      func(req, res, next).catch((err) => next(err));
    };
  }
}
