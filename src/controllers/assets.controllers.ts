import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../interfaces/auths.interfaces";
import { RequestResponseHandler } from "../interfaces/requestResponses.interfaces";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { AssetZod } from "../zod/asset.zod";

const prisma = new PrismaClient();

let ETH_BALANCE =  200;
let USDC_BALANCE = 700000;

const addAssetLiquidity: RequestResponseHandler = async (req: AuthenticatedRequest, res) => {
    const validateAsset = await AssetZod.parseAsync(req.body);
    const {eth, usdc} = validateAsset;
    const user = req.user;

    const ethReserve = ETH_BALANCE;
    const usdcReserve = USDC_BALANCE;

    try {
        const userAsset = await prisma.asset.findUnique({
            where: {userId: user?.id},
        });
        
        if (!userAsset) {
            throw new ApiError(404, "user asset not found");
        }

        if (Number(userAsset.eth) < eth || Number(userAsset.usdc) < usdc) {
            throw new ApiError(400, "insufficient balance to add to liquidity pool");
        }

        await prisma.asset.update({
            where: {userId: user?.id},
            data: {
                eth: {decrement: eth},
                usdc: {decrement: usdc},
            }
        });

        if (ethReserve === 0 && usdcReserve === 0) {
            ETH_BALANCE = eth;
            USDC_BALANCE = usdc;
        } else {
            const ethRatio = eth / ethReserve;
            const usdcRatio = usdc / usdcReserve;

            if (ethRatio !== usdcRatio) {
                return res.status(400).json(
                    new ApiError(400, "Incorrect liquidity ratio. Please provide equal ratio of ETH and USDC." )
                );
            }

            ETH_BALANCE += eth;
            USDC_BALANCE += usdc;
        }

        return res.status(200).json(
            new ApiResponse(200, `Updated ETH: ${ETH_BALANCE} and USDC: ${USDC_BALANCE}`)
        );
    } catch (error) {
        throw new ApiError(500, "error while addign asset to liquidity pool");
    }
}


const buyAsset: RequestResponseHandler = async (req: AuthenticatedRequest, res) => {
    const validateQuantity = await AssetZod.parseAsync(req.body);
    const {quantity} = validateQuantity;
    const user = req.user;

    if (typeof quantity === 'undefined') {
        throw new ApiError(400, "quantity is required");
    }

    if (quantity <= 0) {
        throw new ApiError(400, "quantity must be greater than zero")
    }

    const ethReserve = ETH_BALANCE;
    const usdcReserve = USDC_BALANCE;

    try {
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

        ETH_BALANCE = newEthReserve;
        USDC_BALANCE = newUsdcReserve;

        return res.status(200).json(
            new ApiResponse(200,  `You paid ${paidAmount} USDC for ${quantity} ETH` )
        );
    } catch (error) {
        throw new ApiError(500, "error while buying asset (ETH)");
    }
}

const sellAsset: RequestResponseHandler = async(req, res) => {
    const {quantity} = req.body;
    const ethReserve = ETH_BALANCE;
    const usdcReserve = USDC_BALANCE;

    const gottenUsdc = (usdcReserve * quantity) / (ethReserve + quantity);
    const newEthReserve = ethReserve + quantity;
    const newUsdcReserve = usdcReserve - gottenUsdc; 

    ETH_BALANCE = newEthReserve;
    USDC_BALANCE = newUsdcReserve;

    res.json({
        message: `You received ${gottenUsdc} USDC for ${quantity} ETH`
    });
}

const giveQuote: RequestResponseHandler = async(req, res) => {
    const {side, quantity} = req.body;
    const ethReserve = ETH_BALANCE;
    const usdcReserve = USDC_BALANCE;

    if (side === "buy") {
        const usdcRequired = (usdcReserve * quantity) / (ethReserve - quantity);
        res.json({
            quote: usdcRequired,
            message: `To buy ${quantity} ETH, you need ${usdcRequired} USDC`
        });
    } else if (side === "sell") {
        const usdcToReceive = (usdcReserve * quantity) / (ethReserve + quantity);
        res.json({
            quote: usdcToReceive,
            message: `For selling ${quantity} ETH, you will receive ${usdcToReceive}`
        });
    }
}

export {
    addAssetLiquidity,
    buyAsset,
    sellAsset,
    giveQuote
}