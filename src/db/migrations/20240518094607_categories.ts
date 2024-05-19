import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("categories", (table: Knex.TableBuilder) => {
    table.increments("id").primary();
    table.enu("category", ["small", "medium", "large"]).notNullable().unique();
  });
}

export async function down(knex: Knex): Promise<void> {}
