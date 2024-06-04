import express from "express";

const app = express();
app.use(express.json());

let ETH_BALANCE =  200;
let USDC_BALANCE = 700000;

app.post("/add-liquidity", (req, res) => {
    const {eth, Usdc} = req.body.liquidity;
    const updatedEthBalance = ETH_BALANCE + eth;
    const updatedUsdcBalance = USDC_BALANCE + Usdc;

    ETH_BALANCE = updatedEthBalance;
    USDC_BALANCE = updatedUsdcBalance;

    res.json({
        message: `Updated ETH : ${ETH_BALANCE} and updated USDC: ${USDC_BALANCE}`
    });
})

app.post("/buy-asset", (req, res) => {
    const quantity = req.body.quantity; //1
    const updatedEthQuantity = ETH_BALANCE - quantity; // 199
    const updatedUsdcBalance = ETH_BALANCE * USDC_BALANCE / updatedEthQuantity; // 200 * 700000 / 199
    const paidAmount = updatedUsdcBalance - USDC_BALANCE; // 703517.587939698 - 700000 = 3517.587939698

    ETH_BALANCE = updatedEthQuantity; // 199
    USDC_BALANCE = updatedUsdcBalance; // 703517.587939698

    res.json({
        message: `Yout paid ${paidAmount} USDC for ${quantity} ETH`
    });

})

app.post("/sell-asset", (req, res) => {
    const quantity = req.body.quantity; // 1
    const updatedEthBalance = ETH_BALANCE + quantity; // 200
    const updatedUsdcBalance = ETH_BALANCE * USDC_BALANCE / updatedEthBalance; // 199 * 703517.587939698 / 200
    const gottenUsdc = USDC_BALANCE - updatedEthBalance; // 703517.587939698 - 700000 = 3517.587939698

    ETH_BALANCE = updatedEthBalance; // 200
    USDC_BALANCE = updatedUsdcBalance; // 700000 

    res.json({
        message: `Yout got ${gottenUsdc} USDC for ${quantity} ETH`
    });

})

app.post("/quote", (req, res) => {
    const {side, quantity} = req.body;
    const ethToUsdcRatio = USDC_BALANCE / ETH_BALANCE;

    if (side === "buy") {
        const usdcRequired = quantity * ethToUsdcRatio;
        res.json({
            quote: usdcRequired,
            message: `To buy ${quantity} ETH, you need ${usdcRequired} USDC`
        });
    } else if (side === "sell") {
        const usdcToReceive = quantity * ethToUsdcRatio;
        res.json({
            quote: usdcToReceive,
            message: `For sellign ${quantity} ETH, you will receive ${usdcToReceive}`
        });
    } else {
        res.status(400).json({
            error: "Invalid side. Please provide 'buy' or 'sell'."
        });
    }
});

app.listen(3000);

