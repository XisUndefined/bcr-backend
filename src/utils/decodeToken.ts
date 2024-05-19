import jwt from "jsonwebtoken";

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
          return reject(err);
        }
        if (typeof decoded === "object") {
          resolve(decoded as IVerifiedUserType);
        }
      });
    }
  });
