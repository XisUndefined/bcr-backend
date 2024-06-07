import { QueryBuilder } from "objection";
import { Order, Orders } from "../models/Order.model.js";
import { Paging } from "../types/page.js";
import {
  deleteCache,
  deleteKeysByPrefix,
  getCache,
  setCache,
} from "../utils/cache.js";
import ApiFeatures from "../utils/ApiFeatures.js";

export default class OrderRepository {
  static async count(query: QueryBuilder<Order, Order[]>) {
    const features = new ApiFeatures(query);
    return await features.query.resultSize();
  }

  static async get(
    query: QueryBuilder<Order, Order[]>,
    cacheKey?: string,
    paging?: Paging
  ) {
    const cachedOrder = cacheKey ? await getCache(cacheKey) : null;

    if (cachedOrder) {
      return JSON.parse(cachedOrder) as Order[];
    }

    const features = paging
      ? new ApiFeatures(
          query.throwIfNotFound({
            message: "Order data not found",
          }),
          paging
        )
          .sort()
          .paginate()
      : new ApiFeatures(
          query.throwIfNotFound({
            message: "Order with given ID cannot be found",
          })
        );
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
