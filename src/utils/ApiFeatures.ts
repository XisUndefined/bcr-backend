import { Model, QueryBuilder } from "objection";

export default class ApiFeatures<T extends Model> {
  public query: QueryBuilder<T, T[]>;
  public params: Record<string, any> | undefined;

  constructor(
    query: QueryBuilder<T, T[]>,
    params?: Record<string, any> | undefined
  ) {
    this.query = query;
    this.params = params;
  }

  // public filter(): this {
  //   if (this.params?.start_date && this.params?.finish_date) {
  //     const { start_date, finish_date } = this.params;

  //     this.query = this.query.whereNotExists(function () {
  //       this.select("car_id")
  //         .from("orders")
  //         .where("start_rent", "<", finish_date)
  //         .andWhere("finish_rent", ">", start_date)
  //         .andWhereRaw("cars.id = orders.car_id");
  //     });
  //   }

  //   if (this.params?.capacity) {
  //     this.query = this.query.where(
  //       "capacity",
  //       ">=",
  //       parseInt(this.params.capacity)
  //     );
  //   }

  //   if (this.params?.driver_service) {
  //     this.query = this.query.where(
  //       "driver_service",
  //       this.params.driver_service
  //     );
  //   }

  //   return this;
  // }

  sort(): this {
    if (this.params?.sort) {
      const sortBy = this.params.sort.split(",").map((sortField: string) => {
        if (sortField.startsWith("-")) {
          return { column: sortField.substring(1), order: "desc" };
        } else {
          return { column: sortField, order: "asc" };
        }
      });
      this.query = this.query.orderBy(sortBy);
    } else {
      this.query = this.query.orderBy("updated_at", "desc");
    }
    return this;
  }

  paginate(): this {
    const page = parseInt(this.params?.page) || 1;
    const size = parseInt(this.params?.size) || 10;
    const offset = (page - 1) * size;
    this.query = this.query.limit(size).offset(offset);
    return this;
  }

  // joinUsers(): this {
  //   if (this.params?.userId) {
  //     this.query = this.query.where("orders.user_id", this.params.userId);
  //   }
  //   return this;
  // }
}
