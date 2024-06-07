import { Knex } from "knex";
import bcrypt from "bcrypt";

const hashedPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("users").del();

  // Inserts seed entries
  await knex("users").insert([
    {
      firstname: "Akira",
      email: "muhllis.ahmad@gmail.com",
      password: await hashedPassword("muhlis43edan"),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "Akira"
      )}&size=128`,
      role: "superadmin",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      firstname: "Pridana",
      email: "pridanfadhilah@gmail.com",
      password: await hashedPassword("Yelanwangy69"),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "Pridana"
      )}&size=128`,
      role: "superadmin",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      firstname: "Amario",
      lastname: "Harlastputra",
      email: "amariofausta@gmail.com",
      password: await hashedPassword("Afasta_6868"),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "Amario"
      )}+${encodeURIComponent("Harlastputra")}&size=128`,
      role: "superadmin",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      password: await hashedPassword("Bot_created66"),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "John"
      )}+${encodeURIComponent("Doe")}&size=128`,
      role: "customer",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      firstname: "Jane",
      lastname: "Smith",
      email: "jane.smith@example.com",
      password: await hashedPassword("Bot_created66"),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "Jane"
      )}+${encodeURIComponent("Smith")}&size=128`,
      role: "customer",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      firstname: "Alice",
      lastname: "Johnson",
      email: "alice.johnson@example.com",
      password: await hashedPassword("Bot_created66"),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "Alice"
      )}+${encodeURIComponent("Johnson")}&size=128`,
      role: "customer",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      firstname: "Bob",
      lastname: "Williams",
      email: "bob.williams@example.com",
      password: await hashedPassword("Bot_created66"),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "Bob"
      )}+${encodeURIComponent("Williams")}&size=128`,
      role: "customer",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      firstname: "Emma",
      lastname: "Brown",
      email: "emma.brown@example.com",
      password: await hashedPassword("Bot_created66"),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "Emma"
      )}+${encodeURIComponent("Brown")}&size=128`,
      role: "customer",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      firstname: "Michael",
      lastname: "Davis",
      email: "michael.davis@example.com",
      password: await hashedPassword("Bot_created66"),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "Michael"
      )}+${encodeURIComponent("Davis")}&size=128`,
      role: "customer",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      firstname: "Sarah",
      lastname: "Miller",
      email: "sarah.miller@example.com",
      password: await hashedPassword("Bot_created66"),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "Sarah"
      )}+${encodeURIComponent("Miller")}&size=128`,
      role: "customer",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      firstname: "David",
      lastname: "Garcia",
      email: "david.garcia@example.com",
      password: await hashedPassword("Bot_created66"),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "David"
      )}+${encodeURIComponent("Garcia")}&size=128`,
      role: "customer",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      firstname: "Laura",
      lastname: "Martinez",
      email: "laura.martinez@example.com",
      password: await hashedPassword("Bot_created66"),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "Laura"
      )}+${encodeURIComponent("Martinez")}&size=128`,
      role: "customer",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      firstname: "Chris",
      lastname: "Anderson",
      email: "chris.anderson@example.com",
      password: await hashedPassword("Bot_created66"),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        "Chris"
      )}+${encodeURIComponent("Anderson")}&size=128`,
      role: "customer",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}
