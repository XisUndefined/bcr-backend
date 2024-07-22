import {
  Model,
  RelationMappings,
  ModelObject,
  QueryContext,
  ModelOptions,
} from "objection";
import { User } from "./User.model.js";
import { Car } from "./Car.model.js";
import BaseModel from "./BaseModel.js";

export class Order extends BaseModel {
  static tableName = "orders";

  id!: string;
  user_id!: string;
  car_id!: string;
  bank!: string;
  transfer_image?: string;
  status!: string;
  price!: number;
  start_rent!: Date;
  finish_rent!: Date;
  created_at!: Date;
  updated_at!: Date;

  async $beforeInsert(context: QueryContext) {
    await super.$beforeInsert(context);

    this.created_at = new Date();
    this.updated_at = new Date();
  }

  async $beforeUpdate(opt: ModelOptions, context: QueryContext) {
    await super.$beforeUpdate(opt, context);
    this.updated_at = new Date();
  }

  static get relationMappings(): RelationMappings {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "orders.user_id",
          to: "users.id",
        },
      },

      car: {
        relation: Model.BelongsToOneRelation,
        modelClass: Car,
        join: {
          from: "orders.car_id",
          to: "cars.id",
        },
      },
    };
  }
}

export type Orders = ModelObject<Order>;
