import { Redis } from "ioredis";

const redis = new Redis({
  port: parseInt(process.env.REDIS_PORT as string),
  host: process.env.REDIS_HOST,
  db: parseInt(process.env.REDIS_DB as string),
});

export const setCache = async (key: string, value: string, ttl: number) => {
  await redis.set(key, value, "EX", ttl);
};

export const getCache = async (key: string) => {
  const value = await redis.get(key);
  return value;
};

export const deleteCache = async (key: string) => {
  await redis.del(key);
};

export default redis;
