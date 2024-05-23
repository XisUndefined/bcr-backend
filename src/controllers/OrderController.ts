import { asyncErrorHandler } from "../utils/AsyncErrorHandler.js";
import ResponseError from "../utils/ResponseError.js";
import { Response, Request, NextFunction } from "express";
import { Order } from "../models/Order.model.js";
import { deleteCache, getCache, setCache } from "../utils/cache.js";
import { Users } from "../models/User.model.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { Car } from "../models/Car.model.js";
import { cloudinary } from "../utils/cloudinary.js";

interface UserRequest extends Request {
  user?: Users;
}

interface UserRequestUpload
  extends Request<{ orderId?: string }, {}, { status: string }> {
  user?: Users;
}

interface OrderRequestBody {
  carId: string;
  bank: string;
  startDate: string;
  endDate: string;
}

interface UserRequestCreateOrder extends Request<{}, {}, OrderRequestBody> {
  user?: Users;
}

export default class OrderController {
  static getOrders = asyncErrorHandler(
    async (req: UserRequest, res: Response, next: NextFunction) => {
      let orders;
      const orderQuery = Order.query()
        .select(
          "orders.id",
          "users.email as userEmail",
          "cars.name as car",
          "orders.start_rent",
          "orders.finish_rent",
          "orders.price",
          "orders.status"
        )
        .join("users", "orders.user_id", "users.id")
        .join("cars", "orders.car_id", "cars.id");

      if (req.user?.role === "admin") {
        const cachedOrders = await getCache(`all-${Order.tableName}`);

        if (cachedOrders) {
          orders = JSON.parse(cachedOrders);
        } else {
          const features = new ApiFeatures(orderQuery).filter().sort();
          orders = await features.query;
          await setCache(
            `all-${Order.tableName}`,
            JSON.stringify(orders),
            3600
          );
        }
      } else {
        const cachedOrders = await getCache(
          `${req.user?.id}-${Order.tableName}`
        );

        if (cachedOrders) {
          orders = JSON.parse(cachedOrders);
        } else {
          const features = new ApiFeatures(orderQuery, { userId: req.user?.id })
            .filter()
            .sort()
            .paginate()
            .joinUsers();

          orders = await features.query;
          await setCache(
            `${req.user?.id}-${Order.tableName}`,
            JSON.stringify(orders),
            3600
          );
        }
      }

      res.status(200).json({
        status: "success",
        data: {
          orders,
        },
      });
    }
  );

  static createOrder = asyncErrorHandler(
    async (req: UserRequestCreateOrder, res: Response, next: NextFunction) => {
      // MAKE SURE THE USER THAT TRYING TO CREATE ORDER IS NOT AN ADMIN
      if (req.user?.role === "admin") {
        const error = new ResponseError(
          "The current user do not have the authorization of accesing this route",
          403
        );
        return next(error);
      }

      // CHECK IF THE CAR ID IN THE REQUEST BODY AVAILABLE
      const carAvailable = await Car.query()
        .where("id", req.body.carId)
        .whereNotExists(function () {
          this.select("car_id")
            .from("orders")
            .where("start_date", "<", req.body.endDate)
            .andWhere("finish_date", ">", req.body.startDate)
            .andWhereRaw("cars.id = orders.car_id");
        })
        .first();

      if (!carAvailable) {
        const error = new ResponseError(
          "Car is not available during the specified time period",
          400
        );
        return next(error);
      }

      const price =
        ((new Date(req.body.endDate).getTime() -
          new Date(req.body.startDate).getTime()) /
          (1000 * 60 * 60 * 24)) *
        carAvailable.rent_per_day;

      const newOrder = await Order.query().insert({
        user_id: req.user?.id,
        car_id: req.body.carId,
        bank: req.body.bank,
        price,
        start_rent: new Date(req.body.startDate),
        finish_rent: new Date(req.body.endDate),
      });

      await deleteCache(`all-${Order.tableName}`);

      res.status(201).json({
        status: "success",
        data: newOrder,
      });
    }
  );

  static getOrderById = asyncErrorHandler(
    async (req: UserRequest, res: Response, next: NextFunction) => {
      const selectedOrder = await Order.query().findById(req.params.orderId);

      if (!selectedOrder) {
        const error = new ResponseError(
          "Order with given ID cannot be found!",
          404
        );
        return next(error);
      }

      let order;

      if (req.user?.role === "admin") {
        const cacheOrder = await getCache(
          `${Order.tableName}-${req.params.orderId}`
        );

        if (cacheOrder) {
          order = JSON.parse(cacheOrder);
        } else {
          order = await Order.query().where("id", req.params.orderId).first();
          await setCache(
            `${Order.tableName}-${req.params.orderId}`,
            JSON.stringify(order),
            3600
          );
        }
      } else {
        const cacheUserOrder = await getCache(
          `${req.user?.id}-${Order.tableName}-${req.params.orderId}`
        );

        if (cacheUserOrder) {
          order = JSON.parse(cacheUserOrder);
        } else {
          order = await Order.query()
            .where("id", req.params.orderId)
            .andWhere("user_id", req.user?.id as string)
            .first();
          await setCache(
            `${req.user?.id}-${Order.tableName}-${req.params.orderId}`,
            JSON.stringify(order),
            3600
          );
        }
      }

      res.status(200).json({
        status: "success",
        data: order,
      });
    }
  );

  static updateOrderById = asyncErrorHandler(
    async (req: UserRequestUpload, res: Response, next: NextFunction) => {
      const selectedOrder = await Order.query().findById(
        req.params.orderId as string
      );

      if (!selectedOrder) {
        const error = new ResponseError(
          "Order with given ID cannot be found!",
          404
        );
        return next(error);
      }

      let orderData;

      if (req.user?.role !== "admin") {
        if (!req.file) {
          const error = new ResponseError(
            "Transfer slip input field is required. Please upload your transfer slip",
            400
          );
          return next(error);
        }

        const fileBase64 = req.file.buffer.toString("base64");
        const file = `data:${req.file.mimetype};base64,${fileBase64}`;

        const result = await cloudinary.uploader.upload(file, {
          public_id: `binar-car-rental/upload/data/slip/${req.user?.id}-slip`,
        });

        orderData = { transfer_image: result.secure_url };

        const updatedOrder = await Order.query().patchAndFetchById(
          req.params.orderId as string,
          orderData
        );

        orderData = updatedOrder;
      } else {
        if (req.file) {
          const error = new ResponseError(
            "File upload rejected by the server",
            400
          );
          return next(error);
        }

        orderData = {
          status: req.body.status,
        };

        const updatedOrder = await Order.query().patchAndFetchById(
          req.params.orderId as string,
          orderData
        );

        orderData = updatedOrder;
      }

      await deleteCache(`all-${Order.tableName}`);

      const cachedOrderId = await getCache(
        `${Order.tableName}-${req.params.orderId}`
      );
      if (cachedOrderId) {
        await deleteCache(`${Order.tableName}-${req.params.orderId}`);
      }

      const cachedUserOrder = await getCache(
        `${selectedOrder.user_id}-${Order.tableName}-${req.params.orderId}`
      );
      if (cachedUserOrder) {
        await deleteCache(
          `${selectedOrder.user_id}-${Order.tableName}-${req.params.orderId}`
        );
      }

      res.status(200).json({
        status: "success",
        data: orderData,
      });
    }
  );
}
