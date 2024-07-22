import { asyncErrorHandler } from "../utils/AsyncErrorHandler.js";
import { Request, Response, NextFunction } from "express";
import CarService from "../services/CarService.js";
import { UserRequest } from "../types/users.js";
import {
  CarCategoryParams,
  CarIdParams,
  CarQuery,
  CarReqBody,
  CarResBody,
  CarSearchQuery,
  CarsResBody,
  ReqCarSearchQuery,
  UpdateCarReqBody,
} from "../types/cars.js";
import { ResponseNoData } from "../types/response.js";

export default class CarController {
  static getCars = asyncErrorHandler(
    async (
      req: UserRequest<{}, CarsResBody, {}, CarQuery>,
      res: Response<CarsResBody>,
      next: NextFunction
    ) => {
      const request = { ...req.query };
      request.page = req.query.page ? Number(req.query.page) : 1;
      request.size = req.query.size ? Number(req.query.size) : 10;
      const response = await CarService.get(req.user!, request);
      res.status(200).json({
        status: "success",
        ...response,
      });
    }
  );

  static create = asyncErrorHandler(
    async (
      req: UserRequest<{}, CarResBody, CarReqBody>,
      res: Response<CarResBody>,
      next: NextFunction
    ) => {
      const request = { body: req.body, file: req.file };
      request.body.year = Number(req.body.year);
      request.body.driver_service =
        req.body.driver_service.toString().toLocaleLowerCase() === "true";
      request.body.rent_per_day = Number(req.body.rent_per_day);
      request.body.capacity = Number(req.body.capacity);
      const response = await CarService.create(req.user!, request);

      res.status(201).json({
        status: "success",
        data: response,
      });
    }
  );

  static getById = asyncErrorHandler(
    async (
      req: UserRequest<CarIdParams, CarResBody>,
      res: Response<CarResBody>,
      next: NextFunction
    ) => {
      if (
        req.baseUrl.split("/")[3].startsWith("admin") &&
        ["small", "medium", "large"].includes(req.params.id)
      ) {
        return next();
      }

      const response = await CarService.getById(req.params, req.user);
      res.status(200).json({
        status: "success",
        data: response,
      });
    }
  );

  static search = asyncErrorHandler(
    async (
      req: Request<{}, CarsResBody, {}, CarSearchQuery>,
      res: Response<CarsResBody>,
      next: NextFunction
    ) => {
      const request: Partial<ReqCarSearchQuery> = {
        ...(!!req.query.driver_service &&
          (req.query.driver_service === "true" ||
            req.query.driver_service === "false") && {
            driver_service: req.query.driver_service === "true",
          }),
        page: req.query.page ? Number(req.query.page) : 1,
        size: req.query.size ? Number(req.query.size) : 10,
        capacity: req.query.capacity ? Number(req.query.capacity) : undefined,
        start_date: req.query.start_date,
        finish_date: req.query.finish_date,
        sort: req.query.sort,
      };
      const response = await CarService.search(request);
      res.status(200).json({
        status: "success",
        ...response,
      });
    }
  );

  static getByCategory = asyncErrorHandler(
    async (
      req: UserRequest<CarCategoryParams, CarsResBody, {}, CarQuery>,
      res: Response,
      next: NextFunction
    ) => {
      const request = { ...req.query, ...req.params };
      request.page = req.query.page ? Number(req.query.page) : 1;
      request.size = req.query.size ? Number(req.query.size) : 10;

      const response = await CarService.get(req.user!, request);
      res.status(200).json({
        status: "success",
        ...response,
      });
    }
  );

  static update = asyncErrorHandler(
    async (
      req: UserRequest<CarIdParams, {}, UpdateCarReqBody>,
      res: Response,
      next: NextFunction
    ) => {
      const request = { params: req.params, body: req.body, file: req.file };

      request.body.year = req.body.year ? Number(req.body.year) : undefined;
      request.body.driver_service = req.body.driver_service
        ? req.body.driver_service.toString().toLocaleLowerCase() === "true"
        : undefined;
      request.body.rent_per_day = req.body.rent_per_day
        ? Number(req.body.rent_per_day)
        : undefined;
      request.body.capacity = req.body.capacity
        ? Number(req.body.capacity)
        : undefined;

      if ("year" in request.body && typeof request.body.year === "undefined") {
        delete request.body.year;
      }
      if (
        "driver_service" in request.body &&
        typeof request.body.driver_service === "undefined"
      ) {
        delete request.body.driver_service;
      }
      if (
        "rent_per_day" in request.body &&
        typeof request.body.rent_per_day === "undefined"
      ) {
        delete request.body.rent_per_day;
      }
      if (
        "capacity" in request.body &&
        typeof request.body.capacity === "undefined"
      ) {
        delete request.body.capacity;
      }

      const response = await CarService.update(req.user!, request);
      res.status(200).json({
        status: "success",
        data: response,
      });
    }
  );

  static delete = asyncErrorHandler(
    async (
      req: UserRequest<CarIdParams, ResponseNoData>,
      res: Response<ResponseNoData>,
      next: NextFunction
    ) => {
      await CarService.delete(req.user!, req.params);
      res.status(200).json({
        status: "success",
        message: "Car deleted successfully",
      });
    }
  );
}
