import { Redis } from "ioredis";

const redis = new Redis(
  process.env.NODE_ENV!.trim() === "development"
    ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT as string}/${
        process.env.REDIS_DB
      }`
    : (process.env.UPSTASH_REDIS_URL as string)
);

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

export const deleteKeysByPrefix = async (prefix: string): Promise<void> => {
  const stream = redis.scanStream({
    match: `${prefix}*`,
    count: 100,
  });

  stream.on("data", async (keys: string[]) => {
    if (keys.length) {
      const pipeline = redis.pipeline();
      keys.forEach((key) => pipeline.del(key));
      await pipeline.exec();
    }
  });

  return new Promise((resolve, reject) => {
    stream.on("end", resolve);
    stream.on("error", reject);
  });
};

export default redis;
