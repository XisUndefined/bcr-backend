import express from "express";
import AuthController from "../controllers/AuthController.js";

const router = express.Router();

router.route("/signup").post(AuthController.signup);
router.route("/login").post(AuthController.login);
router.route("/logout").post(AuthController.logout);

export default router;
