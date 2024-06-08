import { Router } from "express";
import { addAssetUser, getUserAsset, loginUser, signupUser } from "../controllers/users.controllers";
import { verifyJWT } from "../middlewares/auths.middlewares";

const router = Router();

router.route("/signup-user").post(signupUser);
router.route("/login-user").post(loginUser);
router.route("/add-asset-user").post(verifyJWT, addAssetUser);
router.route("/get-asset-user").get(verifyJWT, getUserAsset);

export default router;

