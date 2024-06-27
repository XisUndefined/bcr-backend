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

  static logout = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization!.split(" ")[1];
      const response = await UserService.logout(token);
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
      const { id, password, role, created_at, updated_at, ...data } = response;
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
      const { id, password, role, created_at, updated_at, ...data } = response;
      res.status(200).json({
        status: "success",
        data,
      });
    }
  );
}

// export default class AuthController {
//   static signup = asyncErrorHandler(
//     async (
//       req: Request<{}, {}, Partial<Users>>,
//       res: Response,
//       next: NextFunction
//     ) => {
//       const user = await User.query().findOne({ email: req.body.email });

//       if (user) {
//         const error = new ResponseError(
//           "This email is already registered",
//           409
//         );
//         return next(error);
//       }

//       if (req.body.lastname === "") delete req.body.lastname;
//       if (req.body.role) delete req.body.role;
//       if (req.body.id) delete req.body.id;

//       const newUser = await User.query().insert(req.body);

//       sendResponseToken(newUser, 201, res);
//     }
//   );

//   static login = asyncErrorHandler(
//     async (
//       req: Request<{}, {}, Partial<Users>>,
//       res: Response,
//       next: NextFunction
//     ) => {
//       // INPUT CHECK EMAIL & PASSWORD
//       const { email, password } = req.body;
//       if (!email || !password) {
//         const error = new ResponseError(
//           "Please insert email and password",
//           400
//         );
//         return next(error);
//       }

//       // CHECK REGISTERED USER EMAIL
//       const user = await User.query().findOne({ email });
//       if (!user) {
//         const error = new ResponseError(
//           "The requested user could not be found",
//           404
//         );
//         return next(error);
//       }

//       // CHECK PASSWORD
//       const isMatch = await user.comparePassword(password);
//       if (!isMatch) {
//         const error = new ResponseError(
//           "Incorrect password: The password you entered is incorrect. Please try again",
//           400
//         );
//         return next(error);
//       }

//       // SENDING THE TOKEN
//       sendResponseToken(user, 200, res);
//     }
//   );

//   static protect = asyncErrorHandler(
//     async (req: UserRequest, _: Response, next: NextFunction) => {
//       // CHECK TOKEN IN THE REQUEST HEADER
//       const testToken = req.headers.authorization;
//       if (!testToken || !testToken.startsWith("Bearer ")) {
//         const error = new ResponseError("You are not logged in!", 401);
//         return next(error);
//       }

//       const token = testToken.split(" ")[1];

//       // CHECK IF TOKEN BLACKLISTED
//       if ((await getCache(`blacklist-${token}`)) === "true") {
//         const error = new ResponseError(
//           "Token has been invalidated. Please log in again",
//           401
//         );
//         return next(error);
//       }

//       // VERIFIED TOKEN
//       const decodedToken = await decodeToken(
//         token,
//         process.env.JWT_SECRET as string
//       );

//       // CHECK USER WITH ID IN THE TOKEN PAYLOAD
//       const user = await User.query().findById(decodedToken.id);

//       if (!user) {
//         const error = new ResponseError(
//           "The user with the given token does not exist",
//           401
//         );
//         return next(error);
//       }

//       // ASSIGN USER TO REQUEST VARIABLE
//       req.user = user;
//       next();
//     }
//   );

//   static logout = asyncErrorHandler(
//     async (req: Request, res: Response, next: NextFunction) => {
//       const testToken = req.headers.authorization;
//       if (!testToken || !testToken.startsWith("Bearer ")) {
//         const error = new ResponseError("You are not logged in!", 401);
//         return next(error);
//       }

//       const token = testToken.split(" ")[1];

//       const decodedToken = await decodeToken(
//         token,
//         process.env.JWT_SECRET as string
//       );
//       const timeToExpire = decodedToken.exp - Math.floor(Date.now() / 1000);

//       await setCache(`blacklist-${token}`, "true", timeToExpire);

//       res.status(200).json({
//         status: "success",
//         message: "Logged out successfully",
//       });
//     }
//   );
// }
