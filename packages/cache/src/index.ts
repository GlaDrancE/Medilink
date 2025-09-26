import { Redis } from "ioredis"

const getRedisClinet = () => {
    const redisClient = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || "6379"),
        maxRetriesPerRequest: null,
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000)
            return delay;
        }
    })
    redisClient.on("connect", () => {
        console.log("Connected to Redis")
    })
    redisClient.on("error", (error) => {
        console.error("Redis error", error)
    })
    return redisClient;
}

export const redisClient = getRedisClinet();
