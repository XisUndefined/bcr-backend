import { asyncErrorHandler } from "../utils/AsyncErrorHandler.js";
import ResponseError from "../utils/ResponseError.js";
import { Request, Response, NextFunction } from "express";
import { Car, Cars } from "../models/Car.model.js";
import { setCache, getCache, deleteCache } from "../utils/cache.js";
import { Category } from "../models/Category.model.js";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import { access, unlink } from "fs/promises";
import ApiFeatures from "../utils/ApiFeatures.js";
import { Users } from "../models/User.model.js";

interface CarRequestBody extends Partial<Cars> {
  category: string;
}

interface AdminRequest
  extends Request<{ id?: string; category?: string }, {}, CarRequestBody> {
  user?: Users;
}

interface UserRequest extends Request {
  user?: Users;
}

export default class CarController {
  static getCars = asyncErrorHandler(
    async (req: UserRequest, res: Response, next: NextFunction) => {
      let cars;

      if (req.user && req.user.role === "admin") {
        const cachedCars = await getCache(`all-${Car.tableName}`);

        if (cachedCars) {
          res.status(200).json({
            status: "success",
            data: {
              cars: JSON.parse(cachedCars),
            },
          });
        }

        const features = new ApiFeatures(Car.query()).filter().sort();
        cars = await features.query;
        await setCache(`all-${Car.tableName}`, JSON.stringify(cars), 3600);
      }

      const hasQueryParams = Object.keys(req.query).length > 0;

      if (hasQueryParams) {
        const features = new ApiFeatures(Car.query(), req.query)
          .filter()
          .sort()
          .paginate();
        cars = await features.query;
      }

      res.status(200).json({
        status: "success",
        data: {
          cars,
        },
      });
    }
  );

  static createCar = asyncErrorHandler(
    async (req: AdminRequest, res: Response, next: NextFunction) => {
      if (req.user?.role !== "admin") {
        const error = new ResponseError(
          "The current user do not have the authorization of accesing this route",
          403
        );

        return next(error);
      }

      const file = req.file;
      const extension = file?.originalname.split(".").slice(-1);
      const path = `${file?.fieldname}/${req.body.plate}.${extension}`;

      // CEK KATEGORI
      let categoryEntry = await Category.query().findOne({
        category: req.body.category,
      });

      // BUAT KATEGORI BARU JIKA BELUM ADA
      if (!categoryEntry) {
        categoryEntry = await Category.query().insert({
          category: req.body.category,
        });
      }

      const carData = {
        ...req.body,
        category_id: categoryEntry.id,
        image: path,
      };

      const newCar = await Car.query().insert(carData);

      await deleteCache(`all-${Car.tableName}`);

      res.status(201).json({
        status: "success",
        data: newCar,
      });
    }
  );

  static getCarById = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // CHECK CACHE
      const cachedCars = await getCache(`${Car.tableName}-${req.params.id}`);

      if (cachedCars) {
        res.status(200).json({
          status: "success",
          data: {
            cars: JSON.parse(cachedCars),
          },
        });
      }

      const car = await Car.query().findById(req.params.id);

      if (!car) {
        const error = new ResponseError(
          "Car with given ID cannot be found!",
          404
        );
        return next(error);
      }

      await setCache(
        `${Car.tableName}-${req.params.id}`,
        JSON.stringify(car),
        3600
      );

      res.status(200).json({
        status: "success",
        data: car,
      });
    }
  );

  static updateCarById = asyncErrorHandler(
    async (req: AdminRequest, res: Response, next: NextFunction) => {
      // CHECK THE USER AUTHORIZATION
      if (req.user?.role !== "admin") {
        const error = new ResponseError(
          "The current user do not have the authorization of accesing this route",
          403
        );

        return next(error);
      }

      // CEK KATEGORI
      let categoryEntry = await Category.query().findOne({
        category: req.body.category,
      });

      // BUAT KATEGORI BARU JIKA BELUM ADA
      if (!categoryEntry) {
        categoryEntry = await Category.query().insert({
          category: req.body.category,
        });
      }

      let carData;

      if (req.file) {
        const file = req.file;
        const extension = file?.originalname.split(".").slice(-1);
        const filePath = `${file?.fieldname}/${req.body.plate}.${extension}`;

        carData = {
          ...req.body,
          category_id: categoryEntry.id,
          image: filePath,
        };
      } else {
        carData = {
          ...req.body,
          category_id: categoryEntry.id,
        };
      }

      const selectedCar = await Car.query().findById(req.params.id as string);

      if (!selectedCar) {
        const error = new ResponseError(
          "Car with given ID cannot be found!",
          404
        );
        return next(error);
      }

      const updatedCar = await Car.query().patchAndFetchById(
        req.params.id as string,
        carData
      );

      await deleteCache(`all-${Car.tableName}`);
      await setCache(
        `${Car.tableName}-${req.params.id}`,
        JSON.stringify(updatedCar),
        3600
      );

      res.status(200).json({
        status: "success",
        data: {
          cars: updatedCar,
        },
      });
    }
  );

  static deleteCarById = asyncErrorHandler(
    async (req: AdminRequest, res: Response, next: NextFunction) => {
      if (req.user?.role !== "admin") {
        const error = new ResponseError(
          "The current user do not have the authorization of accesing this route",
          403
        );

        return next(error);
      }

      const selectedCar = await Car.query().findById(req.params.id as string);

      if (!selectedCar) {
        const error = new ResponseError(
          "Car with that ID cannot be found!",
          404
        );
        return next(error);
      }

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const fileNameToDelete = selectedCar.image.split("/").slice(-1);

      const filePathToDelete = path.join(
        __dirname,
        "../../public/uploads/data/car",
        fileNameToDelete[0]
      );

      await access(filePathToDelete, fs.constants.F_OK);
      await unlink(filePathToDelete);

      await Car.query().deleteById(req.params.id as string);

      await deleteCache(`all-${Car.tableName}`);
      await deleteCache(`${Car.tableName}-${req.params.id}`);

      res.status(204).json({
        status: "success",
        data: null,
      });
    }
  );

  static getCarByCategory = asyncErrorHandler(
    async (req: AdminRequest, res: Response, next: NextFunction) => {
      // CHECK ADMIN
      if (req.user?.role !== "admin") {
        const error = new ResponseError(
          "The current user do not have the authorization of accesing this route",
          403
        );

        return next(error);
      }

      // CHECK CACHE
      const cachedCars = await getCache(
        `${req.params.category}-${Car.tableName}`
      );

      if (cachedCars) {
        res.status(200).json({
          status: "success",
          data: {
            cars: JSON.parse(cachedCars),
          },
        });
      }

      const features = new ApiFeatures(
        Car.query()
          .joinRelated("category")
          .select("cars.*")
          .where("category.category", req.params.category as string)
      )
        .filter()
        .sort();
      const cars = await features.query;
      await setCache(
        `${req.params.category}-${Car.tableName}`,
        JSON.stringify(cars),
        3600
      );

      res.status(200).json({
        status: "success",
        data: {
          cars,
        },
      });
    }
  );
}
