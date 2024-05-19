import { asyncErrorHandler } from "../utils/AsyncErrorHandler.js";
import ResponseError from "../utils/ResponseError.js";
import { Response, Request, NextFunction } from "express";
import { Order } from "../models/Order.model.js";
import { deleteCache, getCache, setCache } from "../utils/cache.js";
import { User, Users } from "../models/User.model.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { Car } from "../models/Car.model.js";

interface UserRequest extends Request {
  user?: Users;
}

interface UserRequestUpload
  extends Request<{ orderId?: string }, {}, { status: string }> {
  user?: Users;
}

interface OrderRequestBody {
  userId: string;
  carId: string;
  bank: string;
  startDate: string;
  endDate: string;
}

export default class OrderController {
  static getOrders = asyncErrorHandler(
    async (req: UserRequest, res: Response, next: NextFunction) => {
      // RETRIEVED USER
      const user = await User.query().findById(req.user?.id as string);

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

      if (user?.role === "admin") {
        const cachedOrders = await getCache(`all-${Order.tableName}`);

        if (cachedOrders) {
          res.status(200).json({
            status: "success",
            data: {
              orders: JSON.parse(cachedOrders),
            },
          });
        }

        const features = new ApiFeatures(orderQuery)
          .filter()
          .sort()
          .joinUsers();
        orders = await features.query;
      } else {
        const cachedOrders = await getCache(`${user?.id}-${Order.tableName}`);

        if (cachedOrders) {
          res.status(200).json({
            status: "success",
            data: {
              orders: JSON.parse(cachedOrders),
            },
          });
        }

        const features = new ApiFeatures(orderQuery, { userId: user?.id })
          .filter()
          .sort()
          .paginate()
          .joinUsers();

        orders = await features.query;
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
    async (
      req: Request<{}, {}, OrderRequestBody>,
      res: Response,
      next: NextFunction
    ) => {
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
        user_id: req.body.userId,
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
      // CHECK CACHE
      const cacheUserOrder = await getCache(
        `${Order.tableName}-${req.params.orderId}`
      );

      if (cacheUserOrder) {
        res.status(200).json({
          status: "success",
          data: {
            order: JSON.parse(cacheUserOrder),
          },
        });
      }

      const order = await Order.query()
        .where("id", req.params.orderId)
        .andWhere("user_id", req.user?.id as string);

      if (!order) {
        const error = new ResponseError(
          "Order with given ID cannot be found!",
          404
        );
        return next(error);
      }

      await setCache(
        `${Order.tableName}-${req.params.orderId}`,
        JSON.stringify(order),
        3600
      );

      res.status(200).json({
        status: "success",
        data: order,
      });
    }
  );

  static updateOrderById = asyncErrorHandler(
    async (req: UserRequestUpload, res: Response, next: NextFunction) => {
      let orderData;

      if (req.user?.role !== "admin") {
        const file = req.file;
        const extension = file?.originalname.split(".").slice(-1);
        const filePath = `${file?.fieldname}/${req.user?.id}-${req.params.orderId}.${extension}`;

        orderData = { invoice_image: filePath };
      } else {
        orderData = {
          ...req.body,
        };
      }

      const updatedOrder = await Order.query().patchAndFetchById(
        req.params.orderId as string,
        orderData
      );

      if (!updatedOrder) {
        const error = new ResponseError(
          "Order with given ID cannot be found!",
          404
        );
        return next(error);
      }

      await deleteCache(`all-${Order.tableName}`);
      await setCache(
        `${Order.tableName}-${req.params.orderId}`,
        JSON.stringify(updatedOrder),
        3600
      );

      res.status(200).json({
        status: "success",
        data: updatedOrder,
      });
    }
  );
}
