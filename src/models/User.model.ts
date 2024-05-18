import Objection, {
  Model,
  RelationMappings,
  ModelObject,
  CreateValidationErrorArgs,
} from "objection";
import bcrypt from "bcrypt";
import { Order } from "./Order.model.js";

export class User extends Model {
  static tableName = "users";

  id!: string;
  firstname!: string;
  lastname?: string;
  email!: string;
  password!: string;
  avatar?: string;
  role!: string;
  created_at!: Date;
  updated_at!: Date;

  async $beforeInsert(context: Objection.QueryContext) {
    await super.$beforeInsert(context);
    if (this.password) {
      if (this.password.length < 8) {
        throw new Objection.ValidationError({
          message: "The password must be at least 8 characters long",
          type: "ValidationError",
        } as CreateValidationErrorArgs);
      } else if (!/[0-9]/.test(this.password)) {
        throw new Objection.ValidationError({
          message: " The password must contain at least one number",
          type: "ValidationError",
        } as CreateValidationErrorArgs);
      } else if (!/[A-Z]/.test(this.password)) {
        throw new Objection.ValidationError({
          message: "The password must contain at least one uppercase letter",
          type: "ValidationError",
        }) as CreateValidationErrorArgs;
      } else if (!/[a-z]/.test(this.password)) {
        throw new Objection.ValidationError({
          message: "The password must contain at least one lowercase letter",
          type: "ValidationError",
        }) as CreateValidationErrorArgs;
      } else if (
        !/[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\.\>\/\?\|\\]/.test(
          this.password
        )
      ) {
        throw new Objection.ValidationError({
          message: "The password must contain at least one special character",
          type: "ValidationError",
        }) as CreateValidationErrorArgs;
      }
      this.password = await bcrypt.hash(this.password, 12);
    } else if (!this.avatar) {
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

    this.created_at = new Date();
    this.updated_at = new Date();
  }

  async $beforeUpdate(
    opt: Objection.ModelOptions,
    context: Objection.QueryContext
  ) {
    await super.$beforeUpdate(opt, context);
    if (this.password) {
      if (this.password.length < 8) {
        throw new Objection.ValidationError({
          message: "The password must be at least 8 characters long",
          type: "ValidationError",
        } as CreateValidationErrorArgs);
      } else if (!/[0-9]/.test(this.password)) {
        throw new Objection.ValidationError({
          message: " The password must contain at least one number",
          type: "ValidationError",
        } as CreateValidationErrorArgs);
      } else if (!/[A-Z]/.test(this.password)) {
        throw new Objection.ValidationError({
          message: "The password must contain at least one uppercase letter",
          type: "ValidationError",
        }) as CreateValidationErrorArgs;
      } else if (!/[a-z]/.test(this.password)) {
        throw new Objection.ValidationError({
          message: "The password must contain at least one lowercase letter",
          type: "ValidationError",
        }) as CreateValidationErrorArgs;
      } else if (
        !/[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\.\>\/\?\|\\]/.test(
          this.password
        )
      ) {
        throw new Objection.ValidationError({
          message: "The password must contain at least one special character",
          type: "ValidationError",
        }) as CreateValidationErrorArgs;
      }
      this.password = await bcrypt.hash(this.password, 12);
    }

    this.updated_at = new Date();
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
