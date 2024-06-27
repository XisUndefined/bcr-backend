import { Request, Response, NextFunction } from "express";
import { Params, Query } from "../types/request.js";

interface AsyncHandler<P = Params, Rs = any, Rq = any, Q = Query> {
  (
    req: Request<P, Rs, Rq, Q>,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}

export const asyncErrorHandler = <P = Params, Rs = any, Rq = any, Q = Query>(
  func: AsyncHandler<P, Rs, Rq, Q>
): ((
  req: Request<P, Rs, Rq, Q>,
  res: Response,
  next: NextFunction
) => void) => {
  return (req, res, next) => {
    func(req, res, next).catch((err) => next(err));
  };
};
