import express from "express";
import UserController from "../controllers/UserController.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/profile")
  .get(authMiddleware, UserController.get)
  .patch(
    authMiddleware,
    uploadMiddleware.single("avatar"),
    UserController.update
  );

export default router;
