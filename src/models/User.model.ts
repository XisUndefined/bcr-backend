import {
  Model,
  RelationMappings,
  ModelObject,
  QueryContext,
  ModelOptions,
} from "objection";
import bcrypt from "bcrypt";
import { Order } from "./Order.model.js";
import BaseModel from "./BaseModel.js";

export class User extends BaseModel {
  static tableName = "users";

  id!: string;
  firstname!: string;
  lastname?: string;
  email!: string;
  password!: string;
  avatar!: string;
  role!: string;
  created_at!: Date;
  updated_at!: Date;

  async $beforeInsert(context: QueryContext) {
    await super.$beforeInsert(context);
    this.generateAvatar();
    this.password = await bcrypt.hash(this.password, 12);
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  async $beforeUpdate(opt: ModelOptions, context: QueryContext) {
    await super.$beforeUpdate(opt, context);
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    this.updated_at = new Date();
  }

  generateAvatar() {
    if (!this.avatar) {
      if (this.lastname) {
        this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          this.firstname
        )}+${encodeURIComponent(this.lastname)}&size=128`;
      } else {
        this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          this.firstname
        )}&size=128`;
      }
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  static get relationMappings(): RelationMappings {
    return {
      orders: {
        relation: Model.HasManyRelation,
        modelClass: Order,
        join: {
          from: "users.id",
          to: "orders.user_id",
        },
      },
    };
  }
}

export type Users = ModelObject<User>;
