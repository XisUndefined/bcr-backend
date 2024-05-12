// IMPORT PACKAGE
import express, { Express } from "express";

// IMPORT ROUTES

// IMPORT CONTROLLER, HANDLER, AND MIDDLEWARE
import ResponseError from "./utils/ResponseError.js";
import { globalErrorMiddleware } from "./middleware/errorMiddleware.js";

const app: Express = express();

// MIDDLEWARE
app.use(express.urlencoded());
app.use(express.json());

// USE ROUTE

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
