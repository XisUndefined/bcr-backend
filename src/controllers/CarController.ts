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

// export default class CarController {
//   static getCars = asyncErrorHandler(
//     async (req: UserRequest, res: Response, next: NextFunction) => {
//       let cars;

//       if (req.path === "/") {
//         if (req.user && req.user.role === "admin") {
//           const cachedCars = await getCache(`all-${Car.tableName}`);

//           if (cachedCars) {
//             cars = JSON.parse(cachedCars);
//           } else {
//             const features = new ApiFeatures(Car.query()).filter().sort();
//             cars = await features.query;
//             await setCache(`all-${Car.tableName}`, JSON.stringify(cars), 3600);
//           }
//         }
//       } else if (req.path === "/search") {
//         if (!req.query.date || !req.query.time || !req.query.driver_service) {
//           const error = new ResponseError(
//             "All required fields must not be empty",
//             400
//           );
//           return next(error);
//         }

//         const features = new ApiFeatures(Car.query(), req.query)
//           .filter()
//           .sort()
//           .paginate();

//         cars = await features.query;
//       }

//       res.status(200).json({
//         status: "success",
//         data: {
//           cars,
//         },
//       });
//     }
//   );

//   static createCar = asyncErrorHandler(
//     async (req: AdminRequest, res: Response, next: NextFunction) => {
//       if (req.user?.role !== "admin") {
//         const error = new ResponseError(
//           "The current user do not have the authorization of accesing this route",
//           403
//         );

//         return next(error);
//       }

//       if (
//         !req.body.category ||
//         !req.body.plate ||
//         !req.body.transmission ||
//         !req.body.name ||
//         !req.body.year ||
//         !req.body.driver_service ||
//         !req.body.rent_per_day ||
//         !req.body.capacity ||
//         !req.body.description
//       ) {
//         const error = new ResponseError(
//           "All required fields must not be empty",
//           400
//         );
//         return next(error);
//       }

//       if (!["true", "false"].includes(req.body.driver_service.toLowerCase())) {
//         const error = new ResponseError(
//           "Invalid input for driver_service field",
//           400
//         );
//         return next(error);
//       }

//       const plateRegex =
//         /^(A|B|D|F|T|Z|E|H|G|K|R|AB|AD|AE|AG|S|K|W|L|M|N|P|BL|BB|BK|BA|BM|BH|BG|BN|BE|BD|B|DA|KT|DB|DL|DM|DN|DT|DD|DC|DS|DE|DG|DH|EB|ED|EA|PA|PB)\s([0-9]{1,4})\s([A-Z]{1,3})$/g;

//       if (!plateRegex.test(req.body.plate)) {
//         const error = new ResponseError("Invalid car plate number", 400);
//         return next(error);
//       }

//       if (req.body.id) delete req.body.id;

//       let carData;

//       if (req.file) {
//         const fileBase64 = req.file.buffer.toString("base64");
//         const file = `data:${req.file.mimetype};base64,${fileBase64}`;

//         const result = await cloudinary.uploader.upload(file, {
//           public_id: `binar-car-rental/upload/data/car/${req.body.plate}`,
//         });

//         carData = {
//           image: result.secure_url,
//         };
//       }

//       carData = {
//         ...carData,
//         ...req.body,
//         year: parseInt(req.body.year),
//         driver_service: req.body.driver_service === "true",
//         rent_per_day: parseInt(req.body.rent_per_day),
//         capacity: parseInt(req.body.capacity),
//       };

//       const newCar = await Car.query().insert(carData);
//       await deleteCache(`all-${Car.tableName}`);

//       res.status(201).json({
//         status: "success",
//         data: newCar,
//       });
//     }
//   );

//   static getCarById = asyncErrorHandler(
//     async (req: Request, res: Response, next: NextFunction) => {
//       const selectedCar = await Car.query().findById(req.params.id);

//       if (!selectedCar) {
//         const error = new ResponseError(
//           "Car with given ID cannot be found",
//           404
//         );
//         return next(error);
//       }

//       // CHECK CACHE
//       const cachedCar = await getCache(`${Car.tableName}-${req.params.id}`);

//       let car;

//       if (cachedCar) {
//         car = JSON.parse(cachedCar);
//       } else {
//         car = await Car.query().findById(req.params.id);
//         await setCache(
//           `${Car.tableName}-${req.params.id}`,
//           JSON.stringify(car),
//           3600
//         );
//       }

//       res.status(200).json({
//         status: "success",
//         data: car,
//       });
//     }
//   );

//   static updateCarById = asyncErrorHandler(
//     async (req: AdminRequest, res: Response, next: NextFunction) => {
//       // CHECK THE USER AUTHORIZATION
//       if (req.user?.role !== "admin") {
//         const error = new ResponseError(
//           "The current user do not have the authorization of accesing this route",
//           403
//         );

//         return next(error);
//       }

//       if (
//         !req.body.category ||
//         !req.body.plate ||
//         !req.body.transmission ||
//         !req.body.name ||
//         !req.body.year ||
//         !req.body.driver_service ||
//         !req.body.rent_per_day ||
//         !req.body.capacity ||
//         !req.body.description
//       ) {
//         const error = new ResponseError(
//           "All required fields must not be empty",
//           400
//         );
//         return next(error);
//       }

//       if (!["true", "false"].includes(req.body.driver_service.toLowerCase())) {
//         const error = new ResponseError(
//           "Invalid input for driver_service field",
//           400
//         );
//         return next(error);
//       }

//       const plateRegex =
//         /^(A|B|D|F|T|Z|E|H|G|K|R|AB|AD|AE|AG|S|K|W|L|M|N|P|BL|BB|BK|BA|BM|BH|BG|BN|BE|BD|B|DA|KT|DB|DL|DM|DN|DT|DD|DC|DS|DE|DG|DH|EB|ED|EA|PA|PB)\s([0-9]{1,4})\s([A-Z]{1,3})$/g;

//       if (!plateRegex.test(req.body.plate)) {
//         const error = new ResponseError("Invalid car plate number", 400);
//         return next(error);
//       }

//       if (req.body.id) delete req.body.id;

//       const selectedCar = await Car.query().findById(req.params.id as string);

//       if (!selectedCar) {
//         const error = new ResponseError(
//           "Car with given ID cannot be found!",
//           404
//         );
//         return next(error);
//       }

//       let carData;

//       if (req.file) {
//         const fileBase64 = req.file.buffer.toString("base64");
//         const file = `data:${req.file.mimetype};base64,${fileBase64}`;

//         if (req.body.plate !== selectedCar.plate) {
//           await cloudinary.uploader.rename(
//             `binar-car-rental/upload/data/car/${selectedCar.plate}`,
//             `binar-car-rental/upload/data/car/${req.body.plate}`
//           );
//         }

//         const result = await cloudinary.uploader.upload(file, {
//           public_id: `binar-car-rental/upload/data/car/${req.body.plate}`,
//         });

//         carData = {
//           image: result.secure_url,
//         };
//       }

//       carData = {
//         ...carData,
//         ...req.body,
//         year: parseInt(req.body.year),
//         driver_service: req.body.driver_service === "true",
//         rent_per_day: parseInt(req.body.rent_per_day),
//         capacity: parseInt(req.body.capacity),
//       };

//       const newCar = await Car.query().patchAndFetchById(
//         req.params.id as string,
//         carData
//       );
//       await deleteCache(`all-${Car.tableName}`);

//       const cachedCar = await getCache(`${Car.tableName}-${req.params.id}`);
//       if (cachedCar) {
//         await deleteCache(`${Car.tableName}-${req.params.id}`);
//       }

//       const cachedCategory = await getCache(
//         `${selectedCar.category}-${Car.tableName}`
//       );
//       if (cachedCategory) {
//         await deleteCache(`${selectedCar.category}-${Car.tableName}`);
//       }

//       res.status(200).json({
//         status: "success",
//         data: newCar,
//       });
//     }
//   );

//   static deleteCarById = asyncErrorHandler(
//     async (req: AdminRequest, res: Response, next: NextFunction) => {
//       if (req.user?.role !== "admin") {
//         const error = new ResponseError(
//           "The current user do not have the authorization of accesing this route",
//           403
//         );

//         return next(error);
//       }

//       const selectedCar = await Car.query().findById(req.params.id as string);

//       if (!selectedCar) {
//         const error = new ResponseError(
//           "Car with that ID cannot be found!",
//           404
//         );
//         return next(error);
//       }

//       await Car.query().deleteById(req.params.id as string);
//       await cloudinary.uploader.destroy(
//         `binar-car-rental/upload/data/car/${selectedCar.plate}`
//       );

//       await deleteCache(`all-${Car.tableName}`);
//       await deleteCache(`${Car.tableName}-${req.params.id}`);
//       await deleteCache(`${selectedCar.category}-${Car.tableName}`);

//       res.status(202).json({
//         status: "success",
//         data: selectedCar,
//       });
//     }
//   );

//   static getCarByCategory = asyncErrorHandler(
//     async (req: AdminRequest, res: Response, next: NextFunction) => {
//       // CHECK ADMIN
//       if (req.user?.role !== "admin") {
//         const error = new ResponseError(
//           "The current user do not have the authorization of accesing this route",
//           403
//         );

//         return next(error);
//       }

//       // CHECK CACHE
//       const cachedCars = await getCache(
//         `${req.params.category}-${Car.tableName}`
//       );

//       let cars;

//       if (cachedCars) {
//         cars = JSON.parse(cachedCars);
//       } else {
//         const features = new ApiFeatures(
//           Car.query().where("category", req.params.category as string)
//         )
//           .filter()
//           .sort();
//         cars = await features.query;
//         await setCache(
//           `${req.params.category}-${Car.tableName}`,
//           JSON.stringify(cars),
//           3600
//         );
//       }

//       res.status(200).json({
//         status: "success",
//         data: {
//           cars,
//         },
//       });
//     }
//   );

//   static searchCars = asyncErrorHandler(
//     async (req: Request, res: Response, next: NextFunction) => {}
//   );
// }
