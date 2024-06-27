import jwt from "jsonwebtoken";
import { Users } from "../models/User.model.js";
import { Response } from "express";

export const sendResponseToken = (
  newUser: Partial<Users>,
  statusCode: number,
  res: Response
) => {
  const token = jwt.sign(
    {
      id: newUser.id,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  res.status(statusCode).json({
    status:
      statusCode >= 200 && statusCode < 300
        ? "success"
        : statusCode >= 400 && statusCode < 500
        ? "fail"
        : "error",
    data: {
      token,
    },
  });
};
