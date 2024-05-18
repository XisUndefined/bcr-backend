import { Model, RelationMappings, ModelObject } from "objection";
import { Car } from "./Car.model.js";

export class Category extends Model {
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
