import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return (
    knex.schema
      // create users table
      .createTable("users", (table: Knex.TableBuilder) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.string("firstname", 50).notNullable();
        table.string("lastname", 50);
        table.string("email").notNullable().unique();
        table.string("password").notNullable();
        table.string("avatar");
        table
          .enu("role", ["customer", "admin", "superadmin"])
          .defaultTo("customer");
        table.timestamps(true, true);
      })

      // create cars table
      .createTable("cars", (table: Knex.TableBuilder) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.string("created_by").notNullable();
        table.string("updated_by");
        table.string("deleted_by");
        table.string("plate").notNullable().unique();
        table.string("transmission").notNullable();
        table.string("name").notNullable();
        table.integer("year").notNullable();
        table.boolean("driver_service").notNullable();
        table.integer("rent_per_day").notNullable();
        table.string("image");
        table.integer("capacity").notNullable();
        table.enu("category", ["small", "medium", "large"]).notNullable();
        table.text("description").notNullable();
        table.timestamp("deleted_at", { useTz: true });
        table.timestamps(true, true);
      })

      // create orders table
      .createTable("orders", (table: Knex.TableBuilder) => {
        table.uuid("id").primary().defaultTo(knex.fn.uuid());
        table.uuid("user_id").notNullable();
        table.foreign("user_id").references("users.id");
        table.uuid("car_id").notNullable();
        table.foreign("car_id").references("cars.id");
        table.enum("bank", ["mandiri", "bca", "bni"]).notNullable();
        table.string("transfer_image");
        table
          .enum("status", [
            "pending",
            "on-process",
            "approved",
            "rejected",
            "completed",
          ])
          .defaultTo("pending");
        table.integer("price").notNullable();
        table.timestamp("start_rent", { useTz: true }).notNullable();
        table.timestamp("finish_rent", { useTz: true }).notNullable();
        table.timestamps(true, true);
      })
  );
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists("orders")
    .dropTableIfExists("cars")
    .dropTableIfExists("users");
}
