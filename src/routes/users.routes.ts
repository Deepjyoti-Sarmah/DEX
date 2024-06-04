import { Router } from "express";
import { addAssetUser, loginUser, signupUser } from "../controllers/users.controllers";

const router = Router();


router.route("/signup-user").post(signupUser);
router.route("/login-user").post(loginUser);
router.route("/add-asset-user").post(addAssetUser);

export default router;

