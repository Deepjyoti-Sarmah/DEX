import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../interfaces/auths.interfaces";
import { RequestResponseHandler } from "../interfaces/requestResponses.interfaces";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { AssetZod } from "../zod/asset.zod";
import { QuantitySide } from "../zod/quantity.side.zod";
import { getBalances, updateBalances } from "../redis/liquidity";

const prisma = new PrismaClient();

const addAssetLiquidity: RequestResponseHandler = async (req: AuthenticatedRequest, res) => {
    const validateAsset = await AssetZod.parseAsync(req.body);
    const { eth, usdc } = validateAsset;
    const user = req.user;

    if (!(eth > 0 && usdc > 0)) {
        throw new ApiError(400, "Please provide a non-zero value for either ETH or USDC");
    }

    try {
        const {ETH_BALANCE, USDC_BALANCE}  = await getBalances();
        const ethReserve = ETH_BALANCE;
        const usdcReserve = USDC_BALANCE;

        const userAsset = await prisma.asset.findUnique({
            where: { userId: user?.id },
        });

        if (!userAsset) {
            throw new ApiError(404, "user asset not found");
        }

        if (Number(userAsset.eth) < eth || Number(userAsset.usdc) < usdc) {
            throw new ApiError(400, "insufficient balance to add to liquidity pool");
        }

        await prisma.asset.update({
            where: { userId: user?.id },
            data: {
                eth: { decrement: eth },
                usdc: { decrement: usdc },
            }
        });

        if (ethReserve === 0 && usdcReserve === 0) {
            await updateBalances(eth, usdc);
        } else if (ethReserve === 0 || usdcReserve === 0) {
            const newEthBalance = ethReserve === 0 ? eth : ETH_BALANCE;
            const newUsdcBalance = usdcReserve === 0 ? usdc : USDC_BALANCE;
            await updateBalances(newEthBalance, newUsdcBalance);
        } else if (ethReserve > 0 && usdcReserve > 0) {
            // const ethRatio = eth / ethReserve;
            // const usdcRatio = usdc / usdcReserve;

            // if (ethRatio !== usdcRatio) {
            //     return res.status(400).json(
            //         new ApiError(400, "Incorrect liquidity ratio. Please provide equal ratio of ETH and USDC.")
            //     );
            // }
            const newEthBalance = ETH_BALANCE + eth;
            const newUsdcBalance = USDC_BALANCE + usdc;
            await updateBalances(newEthBalance, newUsdcBalance);
        }

        return res.status(200).json(
            new ApiResponse(200, `Updated ETH: ${ETH_BALANCE} and USDC: ${USDC_BALANCE}`)
        );
    } catch (error: any) {
        return res.status(error.code || 500).json(
            new ApiError(500, "error while adding asset to liquidity pool", [error.message])
        );
    }
}

const buyAsset: RequestResponseHandler = async (req: AuthenticatedRequest, res) => {
    const validateQuantity = await QuantitySide.parseAsync(req.body);
    const {quantity} = validateQuantity;
    const user = req.user;

    if (typeof quantity === 'undefined') {
        throw new ApiError(400, "quantity is required");
    }

    if (quantity <= 0) {
        throw new ApiError(400, "quantity must be greater than zero")
    }

    try {

        const {ETH_BALANCE, USDC_BALANCE} = await getBalances();
        const ethReserve = ETH_BALANCE;
        const usdcReserve = USDC_BALANCE;

        const userAsset = await prisma.asset.findUnique({
            where: {userId: user?.id},
        });

        if (!userAsset) {
            throw new ApiError(404, "user asset not found");
        }

        const paidAmount = (usdcReserve * quantity) / (ethReserve - quantity);

        if (Number(userAsset.usdc) < paidAmount) {
            throw new ApiError(400,"insufficient USDC balance");
        }

        await prisma.asset.update({
            where: {userId: user?.id},
            data: {
                eth: {increment: quantity},
                usdc: {decrement: paidAmount},
            },
        });

        const newEthReserve = ethReserve - quantity;
        const newUsdcReserve = usdcReserve + paidAmount;

        await updateBalances(newEthReserve, newUsdcReserve);

        return res.status(200).json(
            new ApiResponse(200,  `You paid ${paidAmount} USDC for ${quantity} ETH` )
        );
    } catch (error: any) {
        return res.status(error.code || 500).json(
            new ApiError(500, "error while buying asset (ETH)", [error.message])
        );
    }
}

const sellAsset: RequestResponseHandler = async(req: AuthenticatedRequest, res) => {
    const validateQuantity = await QuantitySide.parseAsync(req.body);
    const {quantity} = validateQuantity;
    const user = req.user;

    if (typeof quantity === "undefined") {
        throw new ApiError(400, "quantity is required");
    }

    if (quantity <= 0) {
        throw new ApiError(400, "quantity must be greater than zero");
    }

    try {
        const {ETH_BALANCE, USDC_BALANCE} = await getBalances();
        const ethReserve = ETH_BALANCE;
        const usdcReserve = USDC_BALANCE;

        const userAsset = await prisma.asset.findUnique({
            where: {userId: user?.id}
        });

        if (!userAsset) {
            throw new ApiError(404, "user asset not found");
        }

        const gottenUsdc = (usdcReserve * quantity) / (ethReserve + quantity);

        if ( Number(userAsset.eth) < quantity) {
            throw new ApiError(400, "insufficient ETH  balance");
        }

        await prisma.asset.update({
            where: {userId: user?.id},
            data: {
                eth: {decrement: quantity},
                usdc: {increment: gottenUsdc},
            },
        });

        const newEthReserve = ethReserve + quantity;
        const newUsdcReserve = usdcReserve - gottenUsdc; 

        await updateBalances(newEthReserve, newUsdcReserve);

        return res.status(200).json(
            new ApiResponse(200, `You received ${gottenUsdc} USDC for ${quantity} ETH`)
        );
    } catch (error: any) {
        return res.status(error.code || 500).json(
            new ApiError(500, "error while buying asset (USDC)", [error.message])
        );
    }
}

const giveQuote: RequestResponseHandler = async(req, res) => {
    const validateAsset = await QuantitySide.parseAsync(req.body);
    const {side, quantity} = validateAsset;

    if (typeof quantity === "undefined") {
        throw new ApiError(400, "quantity is required");
    }

    if (quantity <= 0) {
        throw new ApiError(400, "quantity must be greater than zero");
    }

    const {ETH_BALANCE, USDC_BALANCE} = await getBalances();
    const ethReserve = ETH_BALANCE;
    const usdcReserve = USDC_BALANCE;

    let quote;
    let message;

    if (side === "buy") {
        const usdcRequired = (usdcReserve * quantity) / (ethReserve - quantity);
        quote = usdcRequired;
        message = `To buy ${quantity} ETH, you need ${usdcRequired} USDC`;
    } else if (side === "sell") {
        const usdcToReceive = (usdcReserve * quantity) / (ethReserve + quantity);
        quote = usdcToReceive;
        message = `For selling ${quantity} ETH, you will receive ${usdcToReceive}`;
    } else {
        throw new ApiError(400, "invalid side. Must be 'buy' or 'sell'");
    }

    return res.status(200).json(
        new ApiResponse(200, {quote, message}, "quotation of the asked quantity")
    );
}

const getLiquidity: RequestResponseHandler = async(req, res) => {
    try {
        const {ETH_BALANCE, USDC_BALANCE} = await getBalances();

        return res.status(200).json(
            new ApiResponse( 200, { 
                ethBalance:ETH_BALANCE, 
                usdcBalace: USDC_BALANCE 
            }, "Current liquidity")
        );
    } catch (error: any) {
        return res.status(error.code || 500).json(
            new ApiError(500, "something went wrong while fetching liquidity", [error.message])
        );
    }
}

export {
    addAssetLiquidity,
    buyAsset,
    sellAsset,
    giveQuote,
    getLiquidity
}
