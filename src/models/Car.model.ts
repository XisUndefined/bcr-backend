import {
  Model,
  RelationMappings,
  ModelObject,
  ModelOptions,
  QueryContext,
} from "objection";
import { Order } from "./Order.model.js";
import BaseModel from "./BaseModel.js";

export class Car extends BaseModel {
  static tableName = "cars";

  id!: string;
  created_by!: string;
  updated_by?: string;
  deleted_by?: string;
  manufacture!: string;
  model!: string;
  transmission!: string;
  plate!: string;
  year!: number;
  driver_service!: boolean;
  rent_per_day!: number;
  image?: string | null;
  capacity!: number;
  type!: string;
  category!: string;
  options?: string;
  specs?: string;
  description!: string;
  deleted_at?: Date;
  created_at!: Date;
  updated_at!: Date;

  async $beforeInsert(context: any) {
    await super.$beforeInsert(context);

    this.created_at = new Date();
    this.updated_at = new Date();
  }

  async $beforeUpdate(opt: ModelOptions, queryContext: QueryContext) {
    await super.$beforeUpdate(opt, queryContext);

    this.updated_at = new Date();
  }

  static get relationMappings(): RelationMappings {
    return {
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
