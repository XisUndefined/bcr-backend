import { QueryBuilder } from "objection";
import { Car, Cars } from "../models/Car.model.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import {
  deleteCache,
  deleteKeysByPrefix,
  getCache,
  setCache,
} from "../utils/cache.js";
import { Order } from "../models/Order.model.js";
import { CarQuery } from "../types/cars.js";

export default class CarRepository {
  static async count(query: QueryBuilder<Car, Car[]>) {
    return await query.resultSize();
  }

  static async get(
    dbQuery: QueryBuilder<Car, Car[]>,
    reqQuery?: CarQuery,
    cacheKey?: string
  ) {
    const cachedCar = cacheKey ? await getCache(cacheKey) : null;

    if (cachedCar) {
      return JSON.parse(cachedCar) as Car[];
    }

    const features = reqQuery
      ? new ApiFeatures(dbQuery, reqQuery).sort().paginate()
      : new ApiFeatures(dbQuery).sort().paginate();
    const car = await features.query;

    if (cacheKey) {
      await setCache(cacheKey, JSON.stringify(car), 3600);
    }

    return car;
  }

  static async create(data: Partial<Cars>) {
    await deleteKeysByPrefix(`${data.category}-${Car.tableName}`);
    await deleteKeysByPrefix(`all-${Car.tableName}`);
    return await Car.query().insert(data);
  }

  static async update(data: Partial<Cars>) {
    // car cache invalidation
    await deleteKeysByPrefix(`${data.category}-${Car.tableName}`);
    await deleteKeysByPrefix(`all-${Car.tableName}`);
    await deleteCache(`${data.id}-${Car.tableName}`);

    // order cache invalidation
    await deleteKeysByPrefix(`all-${Order.tableName}`);

    const { id, ...updatedData } = data;
    return await Car.query().updateAndFetchById(id!, updatedData);
  }
}
