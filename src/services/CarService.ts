import { QueryBuilder } from "objection";
import { Car, Cars } from "../models/Car.model.js";
import { Users } from "../models/User.model.js";
import CarRepository from "../repository/CarRepository.js";
import {
  CarBody,
  CarCategoryParams,
  CarIdParams,
  CarQuery,
} from "../types/cars.js";
import { Paging } from "../types/page.js";
import ResponseError from "../utils/ResponseError.js";
import { cloudinary } from "../utils/cloudinary.js";
import CarValidation from "../validations/CarValidation.js";
import { Validation } from "../validations/validation.js";

export default class CarService {
  static async get(user: Users, request: CarCategoryParams & Paging) {
    if (user.role === "customer") {
      throw new ResponseError(
        "The current user do not have the authorization of accessing this route",
        403
      );
    }

    const parsedRequest = Validation.validate(CarValidation.CATEGORY, request);

    const query = parsedRequest.category
      ? Car.query()
          .where({
            category: parsedRequest.category,
          })
          .throwIfNotFound({ message: "Car data not found" })
      : Car.query().throwIfNotFound({ message: "Car data not found" });
    const cacheKey = parsedRequest.category
      ? `${parsedRequest.category}-${Car.tableName}-${parsedRequest.size}-${parsedRequest.page}`
      : `all-${Car.tableName}-${parsedRequest.size}-${parsedRequest.page}`;

    const { category, ...queryParams } = parsedRequest;
    const cars = await CarRepository.get(query, queryParams, cacheKey);
    const carsCount = await CarRepository.count(query);
    const total_page = Math.ceil(carsCount / queryParams.size!);
    return {
      data: cars,
      page: {
        current_page: queryParams.page,
        total_page,
        size: queryParams.size,
      },
    };
  }

  static async create(
    user: Users,
    request: { body: CarBody; file?: any | undefined }
  ) {
    if (user.role === "customer") {
      throw new ResponseError(
        "The current user do not have the authorization of accessing this route",
        403
      );
    }
    const carRequest = Validation.validate(CarValidation.INPUT, request);

    const findCar = await CarRepository.get(
      Car.query().where({ plate: carRequest.body.plate })
    );

    if (findCar.length !== 0) {
      throw new ResponseError(
        "Car with specific plate number already exist",
        409
      );
    }

    let carData: Partial<Cars> = { created_by: user.id, ...carRequest.body };
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
      deleted_at,
      deleted_by,
      ...filteredFieldCar
    } = car[0];
    const data: Partial<Cars> =
      user && user.role !== "customer" ? car[0] : filteredFieldCar;
    return data;
  }

  static async search(request: CarQuery & Paging) {
    const parsedRequest = Validation.validate(CarValidation.SEARCH, request);
    const { start_date, finish_date } = parsedRequest;

    if (!(new Date(start_date) < new Date(finish_date))) {
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
        deleted_at,
        deleted_by,
        ...rest
      } = car;
      return rest;
    });
    return {
      data,
      page: {
        current_page: parsedRequest.page!,
        total_page,
        size: parsedRequest.size!,
      },
    };
  }

  static async update(
    user: Users,
    request: { params: CarIdParams; body: CarBody; file: any | undefined }
  ) {
    if (user.role === "customer") {
      throw new ResponseError(
        "The current user do not have the authorization of accesing this route",
        403
      );
    }
    const carRequest = Validation.validate(CarValidation.INPUT, request);

    const selectedCar = await CarRepository.get(
      Car.query()
        .where({ id: request.params.id })
        .throwIfNotFound({ message: "Car with given ID cannot be found" })
    );

    let carData: Partial<Cars> = {
      id: selectedCar[0].id,
      updated_by: user.id,
      updated_at: new Date(),
      ...carRequest.body,
    };
    if (
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

    if (selectedCar[0].image) {
      await cloudinary.uploader.destroy(
        `binar-car-rental/upload/data/car/${selectedCar[0].plate}`
      );
    }

    if (selectedCar[0].deleted_by) {
      throw new ResponseError(
        "Car with given ID has been already deleted",
        400
      );
    }

    const carData: Partial<Cars> = {
      id: selectedCar[0].id,
      image: null,
      deleted_by: user.id,
      deleted_at: new Date(),
    };

    return await CarRepository.update(carData);
  }
}
