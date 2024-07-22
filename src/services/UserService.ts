import { User, Users } from "../models/User.model.js";
import UserRepository from "../repository/UserRepository.js";
import jwt from "jsonwebtoken";
import {
  CreateUserReqBody,
  LoginUserReqBody,
  UpdateUserReqBody,
} from "../types/users.js";
import ResponseError from "../utils/ResponseError.js";
import { cloudinary } from "../utils/cloudinary.js";
import { decodeToken } from "../utils/decodeToken.js";
import { UserValidation } from "../validations/UserValidation.js";
import { Validation } from "../validations/validation.js";
import { Response } from "express";

export default class UserService {
  static async signup(request: CreateUserReqBody, user?: Users) {
    const signupRequest = Validation.validate(UserValidation.SIGNUP, request);

    const findUser = await UserRepository.get(
      User.query().where({ email: signupRequest.email })
    );
    if (findUser.length !== 0) {
      throw new ResponseError("This email is already registered!", 409);
    }

    if (user) {
      if (user.role !== "superadmin") {
        throw new ResponseError(
          "The current user do not have the authorization of accesing this route",
          403
        );
      }
      return await UserRepository.create({
        ...signupRequest,
        role: "admin",
      });
    } else {
      return await UserRepository.create({
        ...signupRequest,
        role: "customer",
      });
    }
  }

  static async update(
    user: Users,
    request: { file: Express.Multer.File | undefined; body: UpdateUserReqBody }
  ) {
    const userRequest = Validation.validate(UserValidation.UPDATE, request);

    const selectedUser = await UserRepository.get(
      User.query()
        .where({ id: user.id })
        .throwIfNotFound({ message: "User with given ID cannot be found" })
    );

    const { password_input, ...updateUser } = userRequest.body;
    let userData: Partial<Users> = {
      ...updateUser,
    };
    if (password_input) {
      const isMatch = await selectedUser[0].comparePassword(
        password_input.oldPassword
      );
      if (!isMatch) {
        throw new ResponseError(
          "Incorrect password: the password you entered is incorrect. Please try again",
          400
        );
      }
      userData = { ...userData, password: password_input.newPassword };
    }
    if (userRequest.file) {
      const fileBase64 = userRequest.file.buffer.toString("base64");
      const file = `data:${userRequest.file.mimetype};base64,${fileBase64}`;
      const result = await cloudinary.uploader.upload(file, {
        public_id: `binar-car-rental/upload/data/avatar/${user.id}`,
      });
      userData = { ...userData, avatar: result.secure_url };
    }

    return await UserRepository.update({ id: user.id, ...userData });
  }

  static async refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) {
      throw new ResponseError("You are not logged in!", 401);
    }

    let decodedToken;
    try {
      decodedToken = await decodeToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      );
    } catch (err) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      throw err;
    }

    const findUser = await UserRepository.get(
      User.query()
        .where({ id: decodedToken.id })
        .throwIfNotFound("The user with the given token does not exist")
    );

    const accessToken = jwt.sign(
      {
        id: findUser[0].id,
      },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: "15m" }
    );

    return { token: accessToken, role: findUser[0].role };
  }

  static async login(request: LoginUserReqBody) {
    const loginRequest = Validation.validate(UserValidation.LOGIN, request);

    const findUser = await UserRepository.get(
      User.query()
        .where({ email: loginRequest.email })
        .throwIfNotFound({ message: "The requested user could not be found" })
    );

    const isMatch = await findUser[0].comparePassword(loginRequest.password);
    if (!isMatch) {
      throw new ResponseError(
        "Incorrect password: the password you entered is incorrect. Please try again",
        400
      );
    }

    return findUser[0];
  }

  static async logout(token: string) {
    const decodedToken = await decodeToken(
      token,
      process.env.JWT_ACCESS_SECRET as string
    );
    const timeToExpire = decodedToken.exp - Math.floor(Date.now() / 1000);
    return await UserRepository.dispose({
      key: `blacklist-${token}`,
      value: "true",
      ttl: timeToExpire,
    });
  }

  static async get(user: Users) {
    const findUser = await UserRepository.get(
      User.query()
        .where({ id: user.id })
        .throwIfNotFound({ message: "No user with specified ID" })
    );
    return findUser[0];
  }
}
