
let ETH_BALANCE =  200;
let USDC_BALANCE = 700000;

const addAssetLiquidity = (req: any, res: any) => {
    const { eth, usdc } = req.body.liquidity;
    const ethReserve = ETH_BALANCE;
    const usdcReserve = USDC_BALANCE;

    if (ethReserve === 0 && usdcReserve === 0) {
        ETH_BALANCE = eth;
        USDC_BALANCE = usdc;
    } else {
        const ethRatio = eth / ethReserve;
        const usdcRatio = usdc / usdcReserve;

        if (ethRatio !== usdcRatio) {
            return res.status(400).json({
                error: "Incorrect liquidity ratio. Please provide equal ratio of ETH and USDC."
            });
        }

        ETH_BALANCE += eth;
        USDC_BALANCE += usdc;
    }

    res.json({
        message: `Updated ETH: ${ETH_BALANCE} and USDC: ${USDC_BALANCE}`
    });
}


const buyAsset = (req: any, res: any) => {
    const {quantity} = req.body;
    const ethReserve = ETH_BALANCE;
    const usdcReserve = USDC_BALANCE;

    const paidAmount = (usdcReserve * quantity) / (ethReserve - quantity);
    const newEthReserve = ethReserve - quantity;
    const newUsdcReserve = usdcReserve + paidAmount;

    ETH_BALANCE = newEthReserve;
    USDC_BALANCE = newUsdcReserve;

    res.json({
        message: `You paid ${paidAmount} USDC for ${quantity} ETH`
    });
}

const sellAsset = (req: any, res: any) => {
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

const giveQuote = (req: any, res: any) => {
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
