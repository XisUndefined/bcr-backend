import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("orders", (table: Knex.TableBuilder) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.uuid("user_id").notNullable();
    table.foreign("user_id").references("users.id");
    table.uuid("car_id").notNullable();
    table.foreign("car_id").references("cars.id");
    table.enum("bank", ["mandiri", "bca", "bni"]).notNullable();
    table.string("invoice_image");
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
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("orders");
}
