import { QueryBuilder, raw } from "objection";
import { Car, Cars } from "../models/Car.model.js";
import { Users } from "../models/User.model.js";
import CarRepository from "../repository/CarRepository.js";
import ResponseError from "../utils/ResponseError.js";
import { cloudinary } from "../utils/cloudinary.js";
import CarValidation from "../validations/CarValidation.js";
import { Validation } from "../validations/validation.js";
import {
  CarCategoryParams,
  CarIdParams,
  CarQuery,
  CarReqBody,
  ReqCarSearchQuery,
  UpdateCarReqBody,
} from "../types/cars.js";

export default class CarService {
  static async get(user: Users, request: CarCategoryParams & CarQuery) {
    if (user.role === "customer") {
      throw new ResponseError(
        "The current user do not have the authorization of accessing this route",
        403
      );
    }

    const parsedRequest = Validation.validate(CarValidation.CATEGORY, request);

    let query: QueryBuilder<Car, Car[]>;
    query = parsedRequest.category
      ? Car.query()
          .where({
            category: parsedRequest.category,
          })
          .throwIfNotFound({ message: "Car data not found" })
      : Car.query().throwIfNotFound({ message: "Car data not found" });
    const cacheKey = parsedRequest.category
      ? `${parsedRequest.category}-${Car.tableName}-${parsedRequest.size}-${parsedRequest.page}`
      : `all-${Car.tableName}-${parsedRequest.size}-${parsedRequest.page}`;

    query = parsedRequest.q
      ? query.whereRaw("CONCAT(manufacture, ' ', model) ILIKE ?", [
          `%${parsedRequest.q}%`,
        ])
      : query;

    const { category, q, ...queryParams } = parsedRequest;
    if (queryParams.sort) {
      queryParams.sort.trim().split(",").forEach(field => {
        if (field.includes('name')){
          if (field.startsWith('-')) {
            query = query.orderBy(raw('manufacture || \' \' || model'), 'desc')
          } else {
            query = query.orderBy(raw('manufacture || \' \' || model'), 'asc')
          }
        }
      })
    }
      
    const cars = await CarRepository.get(query, queryParams, cacheKey);
    const carsCount = await CarRepository.count(query);
    const total_page = Math.ceil(carsCount / queryParams.size!);
    return {
      data: cars,
      paging: {
        page: queryParams.page,
        total_page,
        size: queryParams.size,
      },
    };
  }

  static async create(
    user: Users,
    request: { body: CarReqBody; file?: Express.Multer.File | undefined }
  ) {
    if (user.role === "customer") {
      throw new ResponseError(
        "The current user do not have the authorization of accessing this route",
        403
      );
    }
    const carRequest = Validation.validate(CarValidation.CREATE, request);

    const findCar = await CarRepository.get(
      Car.query().where({ plate: carRequest.body.plate })
    );

    if (findCar.length !== 0) {
      throw new ResponseError(
        "Car with specific plate number already exist",
        409
      );
    }

    let carData: Partial<Cars> = { created_by: user.email, ...carRequest.body };
    if (carRequest.file) {
      const fileBase64 = carRequest.file.buffer.toString("base64");
      const file = `data:${carRequest.file.mimetype};base64,${fileBase64}`;
      const result = await cloudinary.uploader.upload(file, {
        public_id: `binar-car-rental/upload/data/car/${carRequest.body.plate}`,
      });

      carData.image = result.secure_url;
    }
    return await CarRepository.create(carData);
  }

  static async getById(request: CarIdParams, user?: Users) {
    if (user && user.role === "customer") {
      throw new ResponseError(
        "The current user do not have the authorization of accessing this route",
        403
      );
    }

    const query = Car.query()
      .whereRaw("id::text = ?", [request.id])
      .throwIfNotFound({
        message: "Car with given ID cannot be found",
      });
    const cacheKey = `${request.id}-${Car.tableName}`;
    const car = await CarRepository.get(query, undefined, cacheKey);
    const {
      created_by,
      created_at,
      updated_by,
      updated_at,
      deleted_by,
      category,
      ...filteredFieldCar
    } = car[0];
    const data = user && user.role !== "customer" ? car[0] : filteredFieldCar;
    return data;
  }

  static async search(request: Partial<ReqCarSearchQuery>) {
    const parsedRequest = Validation.validate(
      CarValidation.SEARCH,
      request as ReqCarSearchQuery
    );
    const { start_date, finish_date } = parsedRequest;

    if (
      !(new Date(start_date) < new Date(finish_date)) ||
      new Date(start_date) <= new Date()
    ) {
      throw new ResponseError("Car data not found", 404);
    }

    let query: QueryBuilder<Car, Car[]>;
    query = Car.query()
      .where("deleted_by", "is", null)
      .whereNotExists(function () {
        this.select("car_id")
          .from("orders")
          .where("start_rent", "<", finish_date)
          .andWhere("finish_rent", ">", start_date)
          .andWhereRaw("cars.id = orders.car_id");
      });

    query = query.where("driver_service", parsedRequest.driver_service);
    query = parsedRequest.capacity
      ? query.where("capacity", ">=", parsedRequest.capacity)
      : query;

    const { sort, page, size } = parsedRequest;
    if (sort) {
      sort.trim().split(",").forEach(field => {
        if (field.includes('name')){
          if (field.startsWith('-')) {
            query = query.orderBy(raw('manufacture || \' \' || model'), 'desc')
          } else {
            query = query.orderBy(raw('manufacture || \' \' || model'), 'asc')
          }
        }
      })
    }
    const carsCount = await CarRepository.count(query);
    const cars = await CarRepository.get(
      query.throwIfNotFound({ message: "Car data not found" }),
      { sort, page, size }
    );
    const total_page = Math.ceil(carsCount / parsedRequest.size!);
    const data = cars.map((car) => {
      const {
        created_at,
        created_by,
        updated_at,
        updated_by,
        deleted_by,
        category,
        ...rest
      } = car;
      return rest;
    });
    return {
      data,
      paging: {
        page: parsedRequest.page!,
        total_page,
        size: parsedRequest.size!,
      },
    };
  }

  static async update(
    user: Users,
    request: {
      params: CarIdParams;
      body: UpdateCarReqBody;
      file: Express.Multer.File | undefined;
    }
  ) {
    if (user.role === "customer") {
      throw new ResponseError(
        "The current user do not have the authorization of accesing this route",
        403
      );
    }
    const carRequest = Validation.validate(CarValidation.UPDATE, request);

    const selectedCar = await CarRepository.get(
      Car.query()
        .where({ id: request.params.id })
        .throwIfNotFound({ message: "Car with given ID cannot be found" })
    );

    let carData: Partial<Cars> = {
      id: selectedCar[0].id,
      updated_by: user.email,
      updated_at: new Date(),
      ...carRequest.body,
    };
    if (
      carRequest.body.plate &&
      carRequest.body.plate !== selectedCar[0].plate &&
      selectedCar[0].image
    ) {
      await cloudinary.uploader.rename(
        `binar-car-rental/upload/data/car/${selectedCar[0].plate}`,
        `binar-car-rental/upload/data/car/${carRequest.body.plate}`
      );
      const extension = selectedCar[0].image
        .split("/")
        .slice(-1)[0]
        .split(".")
        .slice(-1);
      carData = {
        ...carData,
        image: `${selectedCar[0].image
          .split("/")
          .slice(0, -1)
          .join("/")}/${encodeURI(carRequest.body.plate)}.${extension}`,
      };
    }
    if (carRequest.file) {
      const fileBase64 = carRequest.file.buffer.toString("base64");
      const file = `data:${carRequest.file.mimetype};base64,${fileBase64}`;
      const result = await cloudinary.uploader.upload(file, {
        public_id: `binar-car-rental/upload/data/car/${carRequest.body.plate}`,
      });

      carData.image = result.secure_url;
    }

    return await CarRepository.update(carData);
  }

  static async delete(user: Users, request: CarIdParams) {
    if (user.role === "customer") {
      throw new ResponseError(
        "The current user do not have the authorization of accesing this route",
        403
      );
    }

    const selectedCar = await CarRepository.get(
      Car.query()
        .where({ id: request.id })
        .throwIfNotFound({ message: "Car with given ID cannot be found" })
    );

    if (selectedCar[0].deleted_by) {
      throw new ResponseError(
        "Car with given ID has already been deleted",
        410
      );
    }

    if (selectedCar[0].image) {
      await cloudinary.uploader.destroy(
        `binar-car-rental/upload/data/car/${selectedCar[0].plate}`
      );
    }

    const carData: Partial<Cars> = {
      id: selectedCar[0].id,
      image: null,
      deleted_by: user.email,
      deleted_at: new Date(),
    };

    return await CarRepository.update(carData);
  }
}
