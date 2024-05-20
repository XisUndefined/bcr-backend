import Objection, {
  Model,
  RelationMappings,
  ModelObject,
  CreateValidationErrorArgs,
  JSONSchema,
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
  private _confirmPassword?: string;
  avatar?: string;
  role!: string;
  created_at!: Date;
  updated_at!: Date;

  static get jsonSchema(): JSONSchema {
    return {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 6 },
        confirmPassword: { type: "string" },
      },
    };
  }

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
    }
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
    this.validatePassword();
    delete this._confirmPassword;
    this.password = await bcrypt.hash(this.password, 12);

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
    }
    this.validatePassword();
    delete this._confirmPassword;
    this.password = await bcrypt.hash(this.password, 12);
    this.updated_at = new Date();
  }

  set confirmPassword(value: string) {
    this._confirmPassword = value;
  }

  get confirmPassword(): string {
    return this._confirmPassword!;
  }

  validatePassword() {
    if (this.password !== this._confirmPassword) {
      throw new Objection.ValidationError({
        message: "Confirm password does not match",
        type: "ValidationError",
      });
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
