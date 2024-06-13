import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("cars").del();

  // Inserts seed entries
  await knex("cars").insert([
    {
      created_by: "muhllis.ahmad@gmail.com",
      plate: "B 7869 GUH",
      transmission: "Automatic",
      name: "Ford F150",
      year: 2022,
      driver_service: false,
      rent_per_day: 250000,
      capacity: 6,
      category: "large",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      created_by: "muhllis.ahmad@gmail.com",
      plate: "VM 651 H",
      transmission: "Manual",
      name: "Suzuki Esteem",
      year: 2022,
      driver_service: true,
      rent_per_day: 200000,
      capacity: 4,
      category: "small",
      description:
        "Did you know you have rights? The Constitution says you do, and so sdi I. I believe that until proven guilty, every man, woman and child is innocent.",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}
