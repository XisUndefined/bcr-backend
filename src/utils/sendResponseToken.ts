import jwt from "jsonwebtoken";
import { Users } from "../models/User.model.js";
import { Response } from "express";

export const sendResponseToken = (
  newUser: Partial<Users>,
  statusCode: number,
  res: Response
) => {
  const refreshToken = jwt.sign(
    {
      id: newUser.id,
    },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  const accessToken = jwt.sign(
    {
      id: newUser.id,
    },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: "15m" }
  );

  res.cookie("token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to 7 days
  });

  res.status(statusCode).json({
    status:
      statusCode >= 200 && statusCode < 300
        ? "success"
        : statusCode >= 400 && statusCode < 500
        ? "fail"
        : "error",
    data: {
      token: accessToken,
      role: newUser.role,
    },
  });
};
