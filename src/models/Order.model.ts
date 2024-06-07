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

  // static get jsonSchema(): JSONSchema {
  //   return {
  //     type: "object",
  //     required: [
  //       "user_id",
  //       "car_id",
  //       "bank",
  //       "price",
  //       "start_rent",
  //       "finish_rent",
  //     ],
  //     properties: {
  //       user_id: { type: "string", format: "uuid" },
  //       car_id: { type: "string", format: "uuid" },
  //       bank: { type: "string", enum: ["mandiri", "bca", "bni"] },
  //       status: {
  //         type: "string",
  //         enum: ["pending", "on-process", "approved", "rejected", "completed"],
  //       },
  //       price: { type: "number", minimum: 1 },
  //       start_rent: { type: "string", format: "date-time" },
  //       finish_date: { type: "string", format: "date-time" },
  //     },
  //   };
  // }

  async $beforeInsert(context: QueryContext) {
    await super.$beforeInsert(context);

    // if (
    //   new Date(this.start_rent) <
    //   new Date(new Date().setDate(new Date().getDate() + 1))
    // ) {
    //   throw new Objection.ValidationError({
    //     message: "Start date must be at least 1 day after today's date",
    //     type: "ModelValidation",
    //   }) as CreateValidationErrorArgs;
    // }

    // if (new Date(this.start_rent) > new Date(this.finish_rent)) {
    //   throw new Objection.ValidationError({
    //     message: "Finish rent date must not be before the start rent date",
    //     type: "ModelValidation",
    //   });
    // }

    // const isMaximumSevenDays = () => {
    //   const startRentValue = new Date(this.start_rent);
    //   const sevenDaysLater = new Date(startRentValue);
    //   sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    //   return new Date(this.finish_rent) > sevenDaysLater;
    // };

    // if (isMaximumSevenDays()) {
    //   throw new Objection.ValidationError({
    //     message: "Finish rent date must be within 7 days of start rent date",
    //     type: "ModelValidation",
    //   }) as CreateValidationErrorArgs;
    // }

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
