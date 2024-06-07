// IMPORT PACKAGE
import express, { Express } from "express";

// IMPORT ROUTES
import carRouter from "./routes/carRouter.js";
import authRouter from "./routes/authRouter.js";
import orderRouter from "./routes/orderRouter.js";
import userRouter from "./routes/userRouter.js";

// IMPORT CONTROLLER, HANDLER, AND MIDDLEWARE
import ResponseError from "./utils/ResponseError.js";
import { globalErrorMiddleware } from "./middleware/errorMiddleware.js";

const app: Express = express();

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// USE ROUTE
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/cars", carRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/user", userRouter);

app.all("*", (req, res, next) => {
  const err = new ResponseError(
    "The resource requested could not be found on the server",
    404
  );
  next(err);
});

// GLOBAL ERROR HANDLER
app.use(globalErrorMiddleware);

export default app;
