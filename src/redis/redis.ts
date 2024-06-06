import { Redis } from "ioredis";

const redisHost = process.env.REDIS_HOST || 'dex-redis';
const redisPort = process.env.REDIS_PORT || '6379'

const redisClient = new Redis(`redis://${redisHost}:${redisPort}`);

export {redisClient}
