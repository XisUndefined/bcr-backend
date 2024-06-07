import { Request, Response, NextFunction } from "express";

interface Params {
  [key: string]: string;
}

interface Query {
  [key: string]: undefined | string | string[] | Query | Query[];
}

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

// export class AsyncErrorHandler<P, Rs, Rq, Q> {
//   static wraper(func: AsyncHandler) {

//   };
// }
