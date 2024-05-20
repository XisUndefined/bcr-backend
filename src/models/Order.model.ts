import Objection, {
  Model,
  RelationMappings,
  ModelObject,
  CreateValidationErrorArgs,
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
  invoice_image?: string;
  status!: string;
  price!: number;
  start_rent!: Date;
  finish_rent!: Date;
  created_at!: Date;
  updated_at!: Date;

  async $beforeInsert(context: Objection.QueryContext) {
    await super.$beforeInsert(context);
    if (this.start_rent) {
      if (
        new Date(this.start_rent) <
        new Date(new Date().setDate(new Date().getDate() + 1))
      ) {
        throw new Objection.ValidationError({
          message: "Start date must be at least 1 day after today's date",
          type: "ValidationError",
        }) as CreateValidationErrorArgs;
      }
    }
    if (this.finish_rent) {
      const isMaximumSevenDays = () => {
        const startRentValue = new Date(this.start_rent);
        const sevenDaysLater = new Date(startRentValue);
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        return new Date(this.finish_rent) > sevenDaysLater;
      };
      if (isMaximumSevenDays()) {
        throw new Objection.ValidationError({
          message: "Finish rent date must be within 7 days of start rent date",
          type: "ValidationError",
        }) as CreateValidationErrorArgs;
      }
    }

    this.created_at = new Date();
    this.updated_at = new Date();
  }

  async $beforeUpdate(
    opt: Objection.ModelOptions,
    context: Objection.QueryContext
  ) {
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
