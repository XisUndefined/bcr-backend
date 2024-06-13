import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config({
  path:
    process.env.NODE_ENV === "development"
      ? "../../.env.development"
      : "../../.env.production",
});

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: process.env.DB_CONNECTION,
    connection: {
      database: process.env.DB_DATABASE,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
    migrations: {
      directory: "./migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },
  production: {
    client: process.env.DB_CONNECTION,
    connection: {
      database: process.env.DB_DATABASE,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
    migrations: {
      directory: "./migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },
};

export default config;
