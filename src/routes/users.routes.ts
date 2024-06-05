import { Router } from "express";
import { addAssetUser, loginUser, signupUser } from "../controllers/users.controllers";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

router.route("/signup-user").post(signupUser);
router.route("/login-user").post(loginUser);
router.route("/add-asset-user").post(verifyJWT, addAssetUser);

export default router;

