import { asyncErrorHandler } from "../utils/AsyncErrorHandler.js";
import { Response, Request, NextFunction } from "express";
import UserService from "../services/UserService.js";
import { sendResponseToken } from "../utils/sendResponseToken.js";
import { ResponseNoData } from "../types/response.js";
import {
  AuthResBody,
  CreateUserReqBody,
  LoginUserReqBody,
  UpdateUserReqBody,
  UserRequest,
  UserResBody,
} from "../types/users.js";

export default class UserController {
  static signup = asyncErrorHandler(
    async (
      req: UserRequest<{}, AuthResBody | ResponseNoData, CreateUserReqBody>,
      res: Response<AuthResBody | ResponseNoData>,
      next: NextFunction
    ) => {
      const request = req.body;
      const response = await UserService.signup(request, req.user);

      if (!req.user) {
        return sendResponseToken(response, 201, res);
      }

      res.status(201).json({
        status: "success",
        message: "Admin created successfully",
      });
    }
  );

  static login = asyncErrorHandler(
    async (
      req: Request<{}, AuthResBody, LoginUserReqBody>,
      res: Response<AuthResBody>,
      next: NextFunction
    ) => {
      const request = req.body;
      const response = await UserService.login(request);

      sendResponseToken(response, 200, res);
    }
  );

  static refresh = asyncErrorHandler(
    async (
      req: Request<{}, AuthResBody>,
      res: Response<AuthResBody>,
      next: NextFunction
    ) => {
      const refreshToken: string | undefined = req.cookies
        ? req.cookies.token
        : undefined;
      const data = await UserService.refresh(refreshToken, res);
      res.status(200).json({
        status: "success",
        data,
      });
    }
  );

  static logout = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization!.split(" ")[1];
      const response = await UserService.logout(token);
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.status(200).json(response);
    }
  );

  static get = asyncErrorHandler(
    async (
      req: UserRequest,
      res: Response<UserResBody>,
      next: NextFunction
    ) => {
      const response = await UserService.get(req.user!);
      const { id, password, created_at, updated_at, ...data } = response;
      res.status(200).json({
        status: "success",
        data,
      });
    }
  );

  static update = asyncErrorHandler(
    async (
      req: UserRequest<{}, UserResBody, UpdateUserReqBody>,
      res: Response<UserResBody>,
      next: NextFunction
    ) => {
      const request = {
        body: req.body,
        file: req.file,
      };
      const response = await UserService.update(req.user!, request);
      const { id, password, created_at, updated_at, ...data } = response;
      res.status(200).json({
        status: "success",
        data,
      });
    }
  );
}
