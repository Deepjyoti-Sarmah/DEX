import { Router } from "express";
import { addAssetLiquidity, buyAsset, giveQuote, sellAsset } from "../controllers/asset.controllers";


const router = Router();

router.route("/add-asset-liquidity").post(addAssetLiquidity);
router.route("/buy-asset").post(buyAsset);
router.route("/sell-asset").post(sellAsset);
router.route("/quote").post(giveQuote);

export default router;
