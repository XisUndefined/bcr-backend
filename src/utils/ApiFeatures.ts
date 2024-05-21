import { Model, QueryBuilder } from "objection";
import { parseDateRange } from "./parseDateRange.js";

export default class ApiFeatures<T extends Model> {
  public query: QueryBuilder<T, T[]>;
  public queryStr: Record<string, any> | undefined;

  constructor(
    query: QueryBuilder<T, T[]>,
    queryStr?: Record<string, any> | undefined
  ) {
    this.query = query;
    this.queryStr = queryStr;
  }

  public filter(): this {
    if (this.queryStr?.date && this.queryStr?.time) {
      const { startDate, endDate } = parseDateRange(
        this.queryStr.date,
        this.queryStr.time
      );
      this.query = this.query.whereNotExists(function () {
        this.select("car_id")
          .from("orders")
          .where("start_rent", "<", endDate)
          .andWhere("finish_rent", ">", startDate)
          .andWhereRaw("cars.id = orders.car_id");
      });
    }

    if (this.queryStr?.capacity) {
      this.query = this.query.where(
        "capacity",
        ">=",
        parseInt(this.queryStr.capacity)
      );
    }

    if (this.queryStr?.driver_service) {
      this.query = this.query.where(
        "driver_service",
        this.queryStr.driver_service
      );
    }

    return this;
  }

  sort(): this {
    if (this.queryStr?.sort) {
      const sortBy = this.queryStr.sort
        .split(",")
        .map((sortField: string) => sortField.trim());
      this.query = this.query.orderBy(sortBy);
    } else {
      this.query = this.query.orderBy("updated_at", "desc");
    }
    return this;
  }

  paginate(): this {
    const page = parseInt(this.queryStr?.page) || 1;
    const limit = parseInt(this.queryStr?.limit) || 10;
    const offset = (page - 1) * limit;
    this.query = this.query.limit(limit).offset(offset);
    return this;
  }

  joinUsers(): this {
    if (this.queryStr?.userId) {
      this.query = this.query.where("orders.user_id", this.queryStr.userId);
    }
    return this;
  }
}
