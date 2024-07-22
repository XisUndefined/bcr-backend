import { Request } from "express";
import { Users } from "../models/User.model.js";
import { Params, Query } from "./request.js";
import { BaseResponse } from "./response.js";

interface BaseUser {
  firstname: string;
  lastname?: string;
  email: string;
}

export interface CreateUserReqBody extends BaseUser {
  avatar?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginUserReqBody {
  email: string;
  password: string;
}

interface PasswordInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateUserReqBody {
  firstname?: string;
  lastname?: string;
  email?: string;
  password_input?: PasswordInput;
}

export interface UserRequest<P = Params, Rs = any, Rq = any, Q = Query>
  extends Request<P, Rs, Rq, Q> {
  user?: Users;
}

interface Token {
  token: string;
  role: string;
}

interface UserData extends BaseUser {
  avatar: string;
  role: string;
}

export interface AuthResBody extends BaseResponse {
  data: Token;
}

export interface UserResBody extends BaseResponse {
  data: UserData;
}
