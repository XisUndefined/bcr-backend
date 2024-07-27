import { Order } from "../models/Order.model.js";
import OrderService from "../services/OrderService.js";
import {
  CreateOrderReqBody,
  OrderParams,
  OrderQuery,
  OrderResBody,
  UpdateOrderReqBody,
} from "../types/orders.js";
import { Paging } from "../types/page.js";
import { UserRequest } from "../types/users.js";
import { asyncErrorHandler } from "../utils/AsyncErrorHandler.js";
import { Response, NextFunction, Request } from "express";

export default class OrderController {
  static adminList = asyncErrorHandler(
    async (
      req: UserRequest<{}, OrderResBody, {}, OrderQuery>,
      res: Response<OrderResBody>,
      next: NextFunction
    ) => {
      const request = { ...req.query };
      request.page = req.query.page ? Number(req.query.page) : 1;
      request.size = req.query.size ? Number(req.query.size) : 10;
      const response = (await OrderService.adminGet(req.user!, request)) as {
        data: Order[];
        paging: Paging;
      };

      res.status(200).json({
        status: "success",
        ...response,
      });
    }
  );

  static customerList = asyncErrorHandler(
    async (
      req: UserRequest<{}, OrderResBody, {}, OrderQuery>,
      res: Response<OrderResBody>,
      next: NextFunction
    ) => {
      const request = { ...req.query };
      request.page = req.query.page ? Number(req.query.page) : 1;
      request.size = req.query.size ? Number(req.query.size) : 10;
      const response = (await OrderService.customerGet(req.user!, request)) as {
        data: Order[];
        paging: Paging;
      };

      res.status(200).json({
        status: "success",
        ...response,
      });
    }
  );

  static adminGetOrderById = asyncErrorHandler(
    async (
      req: UserRequest<OrderParams, OrderResBody>,
      res: Response<OrderResBody>,
      next: NextFunction
    ) => {
      const request = { ...req.params };
      const response = (await OrderService.adminGet(
        req.user!,
        request
      )) as Order;
      res.status(200).json({
        status: "success",
        data: response,
      });
    }
  );

  static customerGetOrderById = asyncErrorHandler(
    async (
      req: UserRequest<OrderParams, OrderResBody>,
      res: Response<OrderResBody>,
      next: NextFunction
    ) => {
      const request = { ...req.params };
      const response = (await OrderService.customerGet(
        req.user!,
        request
      )) as Order;
      res.status(200).json({
        status: "success",
        data: response,
      });
    }
  );

  static create = asyncErrorHandler(
    async (
      req: UserRequest<{}, OrderResBody, CreateOrderReqBody>,
      res: Response<OrderResBody>,
      next: NextFunction
    ) => {
      const response = await OrderService.create(req.user!, req.body);
      res.status(201).json({
        status: "success",
        data: response,
      });
    }
  );

  static updateFile = asyncErrorHandler(
    async (
      req: UserRequest<OrderParams, OrderResBody>,
      res: Response<OrderResBody>,
      next: NextFunction
    ) => {
      const request = {
        params: req.params,
        file: req.file,
      };
      const response = await OrderService.updateFile(req.user!, request);
      res.status(200).json({
        status: "success",
        data: response,
      });
    }
  );
  static updateStatus = asyncErrorHandler(
    async (
      req: Request<OrderParams, OrderResBody, UpdateOrderReqBody>,
      res: Response<OrderResBody>,
      next: NextFunction
    ) => {
      const request = {
        params: req.params,
        body: req.body,
      };
      const response = await OrderService.updateStatus(request);
      res.status(200).json({
        status: "success",
        data: response,
      });
    }
  );
}
