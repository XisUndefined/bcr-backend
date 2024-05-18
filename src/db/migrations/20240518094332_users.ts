import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", (table: Knex.TableBuilder) => {
    table.uuid("id").primary().defaultTo(knex.fn.uuid());
    table.string("firstname", 50).notNullable();
    table.string("lastname", 50);
    table.string("email").notNullable().unique();
    table.string("password").notNullable();
    table.string("avatar");
    table.enu("role", ["user", "admin"]).defaultTo("user");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users");
}
