import { redisClient } from "./redis";

const ETH_BALANCE_KEY = "ETH_BALANCE";
const USDC_BALANCE_KEY = "USDC_BALANCE";

const initRedis = async () => {
    const ethInitialBalance = process.env.ETH_INITIAL_BALANCE  || '0';
    const usdcInitialBalance = process.env.USDC_INITIAL_BALANCE || '0';

    await redisClient.set(ETH_BALANCE_KEY, ethInitialBalance);
    await redisClient.set(USDC_BALANCE_KEY, usdcInitialBalance);
}

export {initRedis}
