import { Model, QueryBuilder } from "objection";
import { parseDateRange } from "./parseDateRange.js";

export default class ApiFeatures<T extends Model> {
  public query: QueryBuilder<T, T[]>;
  public queryStr: Record<string, any>;

  constructor(query: QueryBuilder<T, T[]>, queryStr: Record<string, any>) {
    this.query = query;
    this.queryStr = queryStr;
  }

  public filter(): this {
    if (this.queryStr.filter) {
      const filters = JSON.parse(this.queryStr.filter);
      if (filters.date && filters.time) {
        const { startDate, endDate } = parseDateRange(
          filters.date,
          filters.time
        );
        this.query = this.query.whereNotExists(function () {
          this.select("car_id")
            .from("orders")
            .where("start_rent", "<", endDate)
            .andWhere("finish_rent", ">", startDate)
            .andWhereRaw("cars.id = orders.car_id");
        });
      }
      if (filters.capacity) {
        this.query = this.query.where(
          "capacity",
          ">=",
          parseInt(filters.capacity)
        );
      }
      if (filters.driverService !== undefined) {
        this.query = this.query.where("driver_service", filters.driverService);
      }
      for (const key in filters) {
        if (
          key !== "date" &&
          key !== "time" &&
          key !== "capacity" &&
          key !== "driverService"
        ) {
          this.query = this.query.where(key, filters[key]);
        }
      }
    }
    return this;
  }

  sort(): this {
    if (this.queryStr.sort) {
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
    const page = parseInt(this.queryStr.page) || 1;
    const limit = parseInt(this.queryStr.limit) || 10;
    const offset = (page - 1) * limit;
    this.query = this.query.limit(limit).offset(offset);
    return this;
  }
}
