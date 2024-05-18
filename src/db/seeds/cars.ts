import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("cars").del();

  const categories = await knex("categories").pluck("id");

  // Inserts seed entries
  await knex("cars").insert([
    {
      category_id: categories[Math.floor(Math.random() * 3)],
      plate: "B 7869 GUH",
      transmission: "Automatic",
      model: "F150",
      manufacture: "Ford",
      year: 2022,
      driver_service: false,
      image: "car/B 7869 GUH.jpg",
      rent_per_day: 250000,
      capacity: 6,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      category_id: categories[Math.floor(Math.random() * 3)],
      plate: "VM 651 H",
      transmission: "Manual",
      model: "Esteem",
      manufacture: "Suzuki",
      year: 2022,
      driver_service: true,
      image: "car/VM 651 H.jpg",
      rent_per_day: 200000,
      capacity: 4,
      description:
        "Did you know you have rights? The Constitution says you do, and so di I. I believe that until proven guilty, every man, woman and child is innocent.",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}
