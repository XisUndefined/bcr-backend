import jwt from "jsonwebtoken";
import ResponseError from "./ResponseError.js";

interface IVerifiedUserType {
  id: string;
  iat: number;
  exp: number;
}

export const decodeToken = async (
  token: string,
  jwtSecret: string
): Promise<IVerifiedUserType> =>
  new Promise((resolve, reject) => {
    if (jwtSecret) {
      jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
          reject(new ResponseError(`Invalid token: ${err.message}`, 498));
        }
        if (typeof decoded === "object") {
          resolve(decoded as IVerifiedUserType);
        }
      });
    } else {
      reject(new ResponseError("JWT Secret not provided", 500));
    }
  });
