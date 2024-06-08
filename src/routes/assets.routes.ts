import { Router } from "express";
import { addAssetLiquidity, buyAsset, getLiquidity, giveQuote, sellAsset } from "../controllers/assets.controllers";
import { verifyJWT } from "../middlewares/auths.middlewares";


const router = Router();

router.route("/add-asset-liquidity").post(verifyJWT, addAssetLiquidity);
router.route("/buy-asset").post(verifyJWT, buyAsset);
router.route("/sell-asset").post(verifyJWT, sellAsset);
router.route("/quote").post(giveQuote);
router.route("/get-liquidity").get(getLiquidity);

export default router;
