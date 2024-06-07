import express from "express";
import UserController from "../controllers/UserController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/admin/signup").post(authMiddleware, UserController.signup);
router.route("/signup").post(UserController.signup);
router.route("/login").post(UserController.login);
router.route("/logout").post(authMiddleware, UserController.logout);

export default router;
