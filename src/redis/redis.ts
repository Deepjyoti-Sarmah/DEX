import { Redis } from "ioredis";
import { ApiError } from "../utils/ApiError";

if (!process.env.REDIS_DATABASE_URL) {
    throw new ApiError(500, "REDIS_DATABASE_URL not defined");
}

const redisClient = new Redis(process.env.REDIS_DATABASE_URL);

export {redisClient}
