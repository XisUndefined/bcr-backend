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
      role: "admin",
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
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}
