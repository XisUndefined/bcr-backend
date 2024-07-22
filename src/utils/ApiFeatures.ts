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

  sort(): this {
    if (this.params?.sort) {
      const sortBy = this.params.sort
        .trim()
        .split(",")
        .filter(
          (sortField: string) => sortField !== "name" && sortField !== "-name"
        )
        .map((sortField: string) => {
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
}
