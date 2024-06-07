import { QueryBuilder } from "objection";
import { User, Users } from "../models/User.model.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { deleteKeysByPrefix, setCache } from "../utils/cache.js";
import { Order } from "../models/Order.model.js";

export default class UserRepository {
  static async get(query: QueryBuilder<User, User[]>) {
    const features = new ApiFeatures(query);
    return await features.query;
  }

  static async create(data: Partial<Users>) {
    return await User.query().insert(data);
  }

  static async update(data: Partial<Users>) {
    // order cache invalidation (contain email user)
    await deleteKeysByPrefix(`all-${Order.tableName}`);
    await deleteKeysByPrefix(`${data.id}`);
    const { id, ...updatedData } = data;
    return await User.query().updateAndFetchById(id!, updatedData);
  }

  static async dispose(data: { key: string; value: string; ttl: number }) {
    const { key, value, ttl } = data;
    await setCache(key, value, ttl);
    return { status: "success", message: "Logged out successfully" };
  }
}
