"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
let ETH_BALANCE = 200;
let USDC_BALANCE = 700000;
// app.post("/add-liquidity", (req, res) => {
// })
app.post("/buy-asset", (req, res) => {
    const quantity = req.body.quantity;
    const updatedEthQuantity = ETH_BALANCE - quantity;
    const updatedUsdcBalance = ETH_BALANCE * USDC_BALANCE / updatedEthQuantity;
    const paidAmount = updatedUsdcBalance - USDC_BALANCE;
    ETH_BALANCE = updatedEthQuantity;
    USDC_BALANCE = updatedUsdcBalance;
    res.json({
        message: `Yout paid ${paidAmount} USDC for ${quantity} ETH`
    });
});
app.post("/sell-asset", (req, res) => {
    const quantity = req.body.quantity;
    const updatedEthBalance = ETH_BALANCE - quantity;
    const updatedUsdcBalance = ETH_BALANCE * USDC_BALANCE / updatedEthBalance;
    const gottenUsdc = updatedUsdcBalance - USDC_BALANCE;
    ETH_BALANCE = updatedEthBalance;
    USDC_BALANCE = updatedUsdcBalance;
    res.json({
        message: `Yout got ${gottenUsdc} USDC for ${quantity} ETH`
    });
});
// app.post("/quote", (req, res) => {
// })
app.listen(3000);
