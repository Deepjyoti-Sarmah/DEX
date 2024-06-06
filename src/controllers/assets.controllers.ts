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
    const { eth, usdc } = validateAsset;
    const user = req.user;

    if (eth === 0 || usdc === 0) {
        throw new ApiError(400, "Please provide a non-zero value for either ETH or USDC");
    }

    const ethReserve = ETH_BALANCE;
    const usdcReserve = USDC_BALANCE;

    try {
        const userAsset = await prisma.asset.findUnique({
            where: { userId: user?.id },
        });

        console.log(userAsset);

        if (!userAsset) {
            throw new ApiError(404, "user asset not found");
        }

        console.log(`User ETH: ${userAsset.eth}, Payload ETH: ${eth}`);
        console.log(`User USDC: ${userAsset.usdc}, Payload USDC: ${usdc}`);

        if (Number(userAsset.eth) < eth || Number(userAsset.usdc) < usdc) {
            throw new ApiError(400, "insufficient balance to add to liquidity pool");
        }

        const updatedAsset = await prisma.asset.update({
            where: { userId: user?.id },
            data: {
                eth: { decrement: eth },
                usdc: { decrement: usdc },
            }
        });
        console.log(updatedAsset);

        if (ethReserve === 0 && usdcReserve === 0) {
            ETH_BALANCE = eth;
            USDC_BALANCE = usdc;
        } else if (ethReserve === 0 || usdcReserve === 0) {
            ETH_BALANCE = ethReserve === 0 ? eth : ETH_BALANCE;
            USDC_BALANCE = usdcReserve === 0 ? usdc : USDC_BALANCE;
        } else if (ethReserve > 0 && usdcReserve > 0) {
            // const ethRatio = eth / ethReserve;
            // const usdcRatio = usdc / usdcReserve;

            // if (ethRatio !== usdcRatio) {
            //     return res.status(400).json(
            //         new ApiError(400, "Incorrect liquidity ratio. Please provide equal ratio of ETH and USDC.")
            //     );
            // }

            ETH_BALANCE += eth;
            USDC_BALANCE += usdc;
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

        console.log("paidAmount", paidAmount);

        if (Number(userAsset.usdc) < paidAmount) {
            throw new ApiError(400,"insufficient USDC balance");
        }

        const updatedAsset = await prisma.asset.update({
            where: {userId: user?.id},
            data: {
                eth: {increment: quantity},
                usdc: {decrement: paidAmount},
            },
        });

        console.log(updatedAsset);

        const newEthReserve = ethReserve - quantity;
        const newUsdcReserve = usdcReserve + paidAmount;

        ETH_BALANCE = newEthReserve;
        USDC_BALANCE = newUsdcReserve;

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

        console.log("gottenUsdc", gottenUsdc)

        if ( Number(userAsset.eth) < quantity) {
            throw new ApiError(400, "insufficient ETH  balance");
        }

        const updatedAsset = await prisma.asset.update({
            where: {userId: user?.id},
            data: {
                eth: {decrement: quantity},
                usdc: {increment: gottenUsdc},
            },
        });

        console.log("sell", updatedAsset)

        const newEthReserve = ethReserve + quantity;
        const newUsdcReserve = usdcReserve - gottenUsdc; 

        ETH_BALANCE = newEthReserve;
        USDC_BALANCE = newUsdcReserve;

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
