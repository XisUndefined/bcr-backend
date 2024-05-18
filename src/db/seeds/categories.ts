import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("categories").del();

  // Inserts seed entries
  await knex("categories").insert([
    { id: 1, category: "small" },
    { id: 2, category: "medium" },
    { id: 3, category: "large" },
  ]);
}
