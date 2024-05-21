import Objection, {
  Model,
  RelationMappings,
  ModelObject,
  CreateValidationErrorArgs,
  JSONSchema,
} from "objection";
import { Order } from "./Order.model.js";
import BaseModel from "./BaseModel.js";

export class Car extends BaseModel {
  static tableName = "cars";

  id!: string;
  plate!: string;
  transmission!: string;
  name!: string;
  year!: number;
  driver_service!: boolean;
  rent_per_day!: number;
  image?: string;
  capacity!: number;
  category!: string;
  description!: string;
  created_at!: Date;
  updated_at!: Date;

  static get jsonSchema(): JSONSchema {
    return {
      type: "object",
      required: [
        "plate",
        "transmission",
        "name",
        "year",
        "driver_service",
        "capacity",
        "category",
        "description",
      ],
      properties: {
        plate: { type: "string" },
        transmission: { type: "string" },
        name: { type: "string", maxLength: 50 },
        year: { type: "number" },
        driver_service: { type: "boolean" },
        rent_per_day: { type: "number" },
        image: { type: "string" },
        capacity: { type: "number", maximum: 10 },
        category: { type: "string", enum: ["small", "medium", "large"] },
        description: { type: "string" },
      },
    };
  }

  async $beforeInsert(context: any) {
    await super.$beforeInsert(context);
    this.validatePlate();

    this.created_at = new Date();
    this.updated_at = new Date();
  }

  async $beforeUpdate(
    opt: Objection.ModelOptions,
    queryContext: Objection.QueryContext
  ) {
    await super.$beforeUpdate(opt, queryContext);
    this.validatePlate();

    this.updated_at = new Date();
  }

  validatePlate() {
    if (this.plate) {
      const isPlate = () => {
        const plateRegex =
          /^(A|B|D|F|T|Z|E|H|G|K|R|AB|AD|AE|AG|S|K|W|L|M|N|P|BL|BB|BK|BA|BM|BH|BG|BN|BE|BD|B|DA|KT|DB|DL|DM|DN|DT|DD|DC|DS|DE|DG|DH|EB|ED|EA|PA|PB)\s([0-9]{1,4})\s([A-Z]{1,3})$/g;
        return !plateRegex.test(this.plate);
      };
      if (isPlate()) {
        throw new Objection.ValidationError({
          message: "Invalid car plate number",
          type: "ValidationError",
        }) as CreateValidationErrorArgs;
      }
    }
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
