import { NextFunction, Response } from "express";
import { asyncErrorHandler } from "../utils/AsyncErrorHandler.js";
import ResponseError from "../utils/ResponseError.js";
import { getCache } from "../utils/cache.js";
import { decodeToken } from "../utils/decodeToken.js";
import UserRepository from "../repository/UserRepository.js";
import { User } from "../models/User.model.js";
import { UserRequest } from "../types/users.js";

export const authMiddleware = asyncErrorHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const testToken =
      req.headers.authorization ||
      (req.headers.Authorization as string | undefined);
    if (!testToken || !testToken.startsWith("Bearer")) {
      const error = new ResponseError("You are not logged in!", 401);
      return next(error);
    }

    const token = testToken.split(" ")[1];

    if ((await getCache(`blacklist-${token}`)) === "true") {
      const error = new ResponseError(
        "Token has been invalidated. Please log in again",
        401
      );
      return next(error);
    }

    const decodedToken = await decodeToken(
      token,
      process.env.JWT_ACCESS_SECRET as string
    );

    const findUser = await UserRepository.get(
      User.query()
        .where({ id: decodedToken.id })
        .throwIfNotFound("The user with the given token does not exist")
    );

    req.user = findUser[0];
    next();
  }
);
