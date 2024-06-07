import { Request } from "express";
import { Users } from "../models/User.model.js";

interface Params {
  [key: string]: string;
}

interface Query {
  [key: string]: undefined | string | string[] | Query | Query[];
}

export interface CreateUserBody {
  firstname: string;
  lastname?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginUserBody {
  email: string;
  password: string;
}

interface PasswordInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateUserBody {
  firstname?: string;
  lastname?: string;
  email?: string;
  password_input?: PasswordInput;
}

export interface UserRequest<P = Params, Rs = any, Rq = any, Q = Query>
  extends Request<P, Rs, Rq, Q> {
  user?: Users;
}
