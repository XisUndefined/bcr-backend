import { Model, RelationMappings, ModelObject } from "objection";
import { Car } from "./Car.model.js";
import BaseModel from "./BaseModel.js";

export class Category extends BaseModel {
  static tableName = "categories";

  id!: number;
  category!: string;

  static get relationMappings(): RelationMappings {
    return {
      cars: {
        relation: Model.HasManyRelation,
        modelClass: Car,
        join: {
          from: "categories.id",
          to: "cars.category_id",
        },
      },
    };
  }
}

export type Categories = ModelObject<Category>;
