import { redisClient } from "./redis";

const ETH_BALANCE_KEY = "ETH_BALANCE";
const USDC_BALANCE_KEY = "USDC_BALANCE";

const getBalances = async () => {
    const ethBalance = await redisClient.get(ETH_BALANCE_KEY);
    const usdcBalance = await redisClient.get(USDC_BALANCE_KEY);

    return {
        ETH_BALANCE: parseFloat(ethBalance || '0'),
        USDC_BALANCE: parseFloat(usdcBalance || '0')
    };
};

const updateBalances = async (ethBalance: number, usdcBalance: number) => {
    await redisClient.set(ETH_BALANCE_KEY, ethBalance.toString());
    await redisClient.set(USDC_BALANCE_KEY, usdcBalance.toString());
}

export {
    getBalances,
    updateBalances
}
