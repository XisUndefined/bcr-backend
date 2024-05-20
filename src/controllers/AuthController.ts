import { asyncErrorHandler } from "../utils/AsyncErrorHandler.js";
import ResponseError from "../utils/ResponseError.js";
import { Response, Request, NextFunction } from "express";
import { User, Users } from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { decodeToken } from "../utils/decodeToken.js";
import { getCache, setCache } from "../utils/cache.js";

interface UserRequest extends Request {
  user?: Users;
}

const sendResponseToken = (
  user: Partial<Users>,
  statusCode: number,
  res: Response
) => {
  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  const data = {
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
  };

  res.status(statusCode).json({
    status:
      statusCode >= 200 && statusCode < 300
        ? "success"
        : statusCode >= 400 && statusCode < 500
        ? "fail"
        : "error",
    token,
    data,
  });
};

export default class AuthController {
  static signup = asyncErrorHandler(
    async (
      req: Request<{}, {}, Partial<Users>>,
      res: Response,
      next: NextFunction
    ) => {
      const user = await User.query().where({
        email: req.body.email,
      });

      if (user) {
        const error = new ResponseError(
          "This email is already registered",
          409
        );
        return next(error);
      }

      const newUser = await User.query().insert(req.body);

      sendResponseToken(newUser, 201, res);
    }
  );

  static login = asyncErrorHandler(
    async (
      req: Request<{}, {}, Partial<Users>>,
      res: Response,
      next: NextFunction
    ) => {
      // INPUT CHECK EMAIL & PASSWORD
      const { email, password } = req.body;
      if (!email || !password) {
        const error = new ResponseError(
          "Please insert email and password",
          400
        );
        return next(error);
      }

      // CHECK REGISTERED USER EMAIL
      const user = await User.query().findOne({ email });
      if (!user) {
        const error = new ResponseError(
          "The requested user could not be found",
          404
        );
        return next(error);
      }

      // CHECK PASSWORD
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        const error = new ResponseError(
          "Incorrect password: The password you entered is incorrect. Please try again",
          400
        );
        return next(error);
      }

      // SENDING THE TOKEN
      sendResponseToken(user, 200, res);
    }
  );

  static protect = asyncErrorHandler(
    async (req: UserRequest, _: Response, next: NextFunction) => {
      // CHECK TOKEN IN THE REQUEST HEADER
      const testToken = req.headers.authorization;
      if (!testToken || !testToken.startsWith("bearer ")) {
        const error = new ResponseError("You are not logged in!", 401);
        return next(error);
      }

      const token = testToken.split(" ")[1];

      // CHECK IF TOKEN BLACKLISTED
      if ((await getCache(`blacklist-${token}`)) === "true") {
        const error = new ResponseError(
          "Token has been invalidated. Please log in again",
          401
        );
        return next(error);
      }

      // VERIFIED TOKEN
      const decodedToken = await decodeToken(
        token,
        process.env.JWT_SECRET as string
      );

      // CHECK USER WITH ID IN THE TOKEN PAYLOAD
      const user = await User.query().findById(decodedToken.id);

      if (!user) {
        const error = new ResponseError(
          "The user with the given token does not exist",
          401
        );
        return next(error);
      }

      // ASSIGN USER TO REQUEST VARIABLE
      req.user = user;
      next();
    }
  );

  static logout = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const testToken = req.headers.authorization;
      if (!testToken || !testToken.startsWith("bearer ")) {
        const error = new ResponseError("You are not logged in!", 401);
        return next(error);
      }

      const token = testToken.split(" ")[1];

      const decodedToken = await decodeToken(
        token,
        process.env.JWT_SECRET as string
      );
      const timeToExpire = decodedToken.exp - Math.floor(Date.now() / 1000);

      await setCache(`blacklist-${token}`, "true", timeToExpire);

      res.status(200).json({
        status: "success",
        message: "Logged out successfully",
      });
    }
  );
}
