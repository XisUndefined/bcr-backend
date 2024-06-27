import { raw } from "objection";
import { Car } from "../models/Car.model.js";
import { Order, Orders } from "../models/Order.model.js";
import { Users } from "../models/User.model.js";
import CarRepository from "../repository/CarRepository.js";
import OrderRepository from "../repository/OrderRepository.js";
import {
  CreateOrderReqBody,
  OrderParams,
  OrderQuery,
  UpdateOrderReqBody,
} from "../types/orders.js";
import ResponseError from "../utils/ResponseError.js";
import { cloudinary } from "../utils/cloudinary.js";
import OrderValidation from "../validations/OrderValidation.js";
import { Validation } from "../validations/validation.js";

export default class OrderService {
  static async get(user: Users, request: OrderParams | OrderQuery) {
    let orderQuery = Order.query()
      .select(
        "orders.id",
        "users.email as email",
        raw("concat(cars.manufacture, ' ', cars.model) as car"),
        "orders.bank",
        "orders.transfer_image",
        "orders.status",
        "orders.price",
        "orders.start_rent",
        "orders.finish_rent",
        "orders.created_at",
        "orders.updated_at"
      )
      .join("users", "orders.user_id", "users.id")
      .join("cars", "orders.car_id", "cars.id");

    let cacheKey: string | undefined = `all-${Order.tableName}`;

    if ((request as OrderParams).orderId) {
      if (user.role === "customer") {
        cacheKey = `${user.id}-${(request as OrderParams).orderId}-${
          Order.tableName
        }`;
        orderQuery = orderQuery
          .whereRaw("orders.id::text = ?", (request as OrderParams).orderId)
          .andWhere("user_id", user.id)
          .throwIfNotFound({ message: "No order with given ID" });
      } else {
        cacheKey = undefined;
        orderQuery = orderQuery
          .whereRaw("orders.id::text = ?", (request as OrderParams).orderId)
          .throwIfNotFound({ message: "No order with given ID" });
      }
    } else {
      if (user.role === "customer") {
        cacheKey = `${user.id}-${Order.tableName}`;
        orderQuery = orderQuery.where("orders.user_id", user.id);
      }
    }

    if ((request as OrderQuery).q) {
      orderQuery = orderQuery.where((builder) => {
        builder
          .where("users.email", "ILIKE", `%${(request as OrderQuery).q}%`)
          .orWhere(
            "cars.manufacture",
            "ILIKE",
            `%${(request as OrderQuery).q}%`
          )
          .orWhere("cars.model", "ILIKE", `%${(request as OrderQuery).q}%`)
          .orWhere("orders.status", "ILIKE", `%${(request as OrderQuery).q}%`);
      });
    }

    const { q, ...reqQuery } = request as OrderQuery;
    const orders = (request as OrderParams).orderId
      ? await OrderRepository.get(orderQuery, cacheKey)
      : await OrderRepository.get(orderQuery, cacheKey, reqQuery);
    const orderCount = await OrderRepository.count(orderQuery);
    const total_page = (request as OrderQuery).size
      ? Math.ceil(orderCount / Number((request as OrderQuery).size))
      : Math.ceil(orderCount / 10);
    return (request as OrderParams).orderId
      ? orders[0]
      : {
          data: orders,
          paging: {
            page: (request as OrderQuery).page
              ? Number((request as OrderQuery).page)
              : 1,
            total_page,
            size: (request as OrderQuery).size
              ? Number((request as OrderQuery).size)
              : 10,
          },
        };
  }

  static async create(user: Users, request: CreateOrderReqBody) {
    if (user.role !== "customer") {
      throw new ResponseError("A non-customer user cannot make an order", 403);
    }

    const parsedBody = Validation.validate(OrderValidation.CREATE, request);

    const findCar = await CarRepository.get(
      Car.query()
        .where("id", parsedBody.car_id)
        .andWhere("deleted_by", "is", null)
        .whereNotExists(function () {
          this.select("car_id")
            .from("orders")
            .where("start_rent", "<", parsedBody.finish_rent)
            .andWhere("finish_rent", ">", parsedBody.start_rent)
            .andWhereRaw("cars.id = orders.car_id");
        })
        .throwIfNotFound({
          message:
            "Car currently is not in operational or not available during the specified time period",
        })
    );

    const price =
      ((new Date(parsedBody.finish_rent).getTime() -
        new Date(parsedBody.start_rent).getTime()) /
        (1000 * 60 * 60 * 24)) *
      findCar[0].rent_per_day;

    const newOrder = await OrderRepository.create({
      user_id: user.id,
      car_id: parsedBody.car_id,
      bank: parsedBody.bank,
      price,
      start_rent: new Date(parsedBody.start_rent),
      finish_rent: new Date(parsedBody.finish_rent),
    });
    return newOrder;
  }

  static async update(
    user: Users,
    request: {
      params: OrderParams;
      body: UpdateOrderReqBody;
      file: Express.Multer.File | undefined;
    }
  ) {
    let orderData: Partial<Orders>;
    if (user.role === "customer") {
      await OrderRepository.get(
        Order.query()
          .whereRaw("id::text = ?", request.params.orderId)
          .andWhere("user_id", user.id)
          .throwIfNotFound({ message: "No order with given ID" }),
        `${user.id}-${request.params.orderId}-${Order.tableName}`
      );
      const parsedRequest = Validation.validate(
        OrderValidation.FILE_UPDATE,
        request
      );
      const fileBase64 = parsedRequest.file?.buffer.toString("base64");
      const file = `data:${parsedRequest.file?.mimetype};base64,${fileBase64}`;
      const result = await cloudinary.uploader.upload(file, {
        public_id: `binar-car-rental/upload/data/slip/${parsedRequest.params.orderId}-slip`,
      });

      orderData = {
        id: request.params.orderId,
        status: "on-process",
        transfer_image: result.secure_url,
      };
    } else {
      await OrderRepository.get(
        Order.query()
          .whereRaw("id::text = ?", request.params.orderId)
          .throwIfNotFound({ message: "No order with given ID" }),
        `${request.params.orderId}-${Order.tableName}`
      );
      const parsedRequest = Validation.validate(
        OrderValidation.STATUS_UPDATE,
        request
      );
      orderData = {
        id: request.params.orderId,
        status: parsedRequest.body.status,
      };
    }
    return await OrderRepository.update(orderData);
  }
}
