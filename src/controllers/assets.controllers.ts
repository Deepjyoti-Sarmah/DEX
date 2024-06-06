import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../interfaces/auths.interfaces";
import { RequestResponseHandler } from "../interfaces/requestResponses.interfaces";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { AssetZod } from "../zod/asset.zod";
import { QuantitySide } from "../zod/quantity.side.zod";

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
    const validateQuantity = await QuantitySide.parseAsync(req.body);
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

    const ethReserve = ETH_BALANCE;
    const usdcReserve = USDC_BALANCE;

    try {
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

        ETH_BALANCE = newEthReserve;
        USDC_BALANCE = newUsdcReserve;

        return res.status(200).json(
            new ApiResponse(200, `You received ${gottenUsdc} USDC for ${quantity} ETH`)
        );
    } catch (error) {
        throw new ApiError(500, "error while buying asset (USDC)");
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

export {
    addAssetLiquidity,
    buyAsset,
    sellAsset,
    giveQuote
}
