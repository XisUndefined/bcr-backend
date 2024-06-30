import { QueryBuilder } from "objection";
import { Order, Orders } from "../models/Order.model.js";
import {
  deleteCache,
  deleteKeysByPrefix,
  getCache,
  setCache,
} from "../utils/cache.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { OrderQuery } from "../types/orders.js";

export default class OrderRepository {
  static async count(query: QueryBuilder<Order, Order[]>) {
    const features = new ApiFeatures(query);
    return await features.query.resultSize();
  }

  static async get(
    dbQuery: QueryBuilder<Order, Order[]>,
    cacheKey?: string,
    reqQuery?: OrderQuery
  ) {
    const cachedOrder = cacheKey ? await getCache(cacheKey) : null;

    if (cachedOrder) {
      return JSON.parse(cachedOrder) as Order[];
    }

    const features = reqQuery
      ? new ApiFeatures(
          dbQuery.throwIfNotFound({
            message: "Order data not found",
          }),
          reqQuery
        )
          .sort()
          .paginate()
      : new ApiFeatures(dbQuery);
    const order = await features.query;

    if (cacheKey) {
      await setCache(cacheKey, JSON.stringify(order), 3600);
    }

    return order;
  }

  static async create(data: Partial<Orders>) {
    await deleteKeysByPrefix(`all-${Order.tableName}`);
    await deleteKeysByPrefix(`${data.user_id}-${Order.tableName}`);
    return await Order.query().insert(data);
  }

  static async update(data: Partial<Orders>) {
    await deleteKeysByPrefix(`all-${Order.tableName}`);
    await deleteKeysByPrefix(`${data.user_id}-${Order.tableName}`);
    await deleteCache(`${data.user_id}-${data.id}-${Order.tableName}`);
    const { id, ...updatedData } = data;
    return await Order.query().updateAndFetchById(id!, updatedData);
  }
}
