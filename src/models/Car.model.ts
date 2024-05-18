import Objection, {
  Model,
  RelationMappings,
  ModelObject,
  CreateValidationErrorArgs,
} from "objection";
import { Order } from "./Order.model.js";
import { Category } from "./Category.model.js";

export class Car extends Model {
  static tableName = "cars";

  id!: string;
  category_id!: number;
  plate!: string;
  transmission!: string;
  manufacture!: string;
  model!: string;
  year!: number;
  driver_service!: boolean;
  rent_per_day!: number;
  image!: string;
  capacity!: number;
  description!: string;
  created_at!: Date;
  updated_at!: Date;

  async $beforeInsert(context: any) {
    await super.$beforeInsert(context);
    if (this.plate) {
      const isPlate = () => {
        const plateRegex = /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{0,3}$/;
        return !plateRegex.test(this.plate);
      };
      if (isPlate()) {
        throw new Objection.ValidationError({
          message: "Invalid car plate number",
          type: "ValidationError",
        }) as CreateValidationErrorArgs;
      }
    }

    this.created_at = new Date();
    this.updated_at = new Date();
  }

  async $beforeUpdate(
    opt: Objection.ModelOptions,
    queryContext: Objection.QueryContext
  ) {
    await super.$beforeUpdate(opt, queryContext);
    this.updated_at = new Date();
  }

  static get relationMappings(): RelationMappings {
    return {
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: Category,
        join: {
          from: "cars.category_id",
          to: "categories.id",
        },
      },
      orders: {
        relation: Model.HasManyRelation,
        modelClass: Order,
        join: {
          from: "cars.id",
          to: "orders.car_id",
        },
      },
    };
  }
}

export type Cars = ModelObject<Car>;
