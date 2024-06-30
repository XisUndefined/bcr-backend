import { NextFunction, Response } from "express";
import { UserRequest } from "../types/users.js";
import { asyncErrorHandler } from "../utils/AsyncErrorHandler.js";
import ResponseError from "../utils/ResponseError.js";

export const adminMiddleware = asyncErrorHandler(async (req: UserRequest, _res: Response, next: NextFunction) => {
  if (req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
    throw new ResponseError('The current user do not have the authorization of accessing this route', 403)
  }
  next()
})