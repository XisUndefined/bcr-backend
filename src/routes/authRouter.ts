import express from "express";
import UserController from "../controllers/UserController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/signup").post(UserController.signup);
router.route("/refresh").get(UserController.refresh);
router.route("/login").post(UserController.login);
router.route("/logout").post(authMiddleware, UserController.logout);

export default router;
