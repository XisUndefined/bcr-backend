import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("cars", (table: Knex.TableBuilder) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.integer("category_id").notNullable();
    table.foreign("category_id").references("categories.id");
    table.string("plate").notNullable().unique();
    table.string("transmission").notNullable();
    table.string("name").notNullable();
    table.integer("year").notNullable();
    table.boolean("driver_service").notNullable();
    table.integer("rent_per_day").notNullable();
    table.string("image").notNullable();
    table.integer("capacity").notNullable();
    table.text("description").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("cars");
}
