import Redis from "ioredis";

let redis: Redis | null = null;

export function createRedisClient() {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("Redis URL not configured, caching disabled");
    return null;
  }

  try {
    redis = new Redis(redisUrl);
    console.log("Redis client connected");
    return redis;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    return null;
  }
}