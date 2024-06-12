import express from "express";
import UserController from "../controllers/UserController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import CarController from "../controllers/CarController.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/auth/signup").post(authMiddleware, UserController.signup);

router
  .route("/cars")
  .get(authMiddleware, CarController.getCars)
  .post(authMiddleware, uploadMiddleware.single("car"), CarController.create);

router
  .route("/cars/:id")
  .get(authMiddleware, CarController.getById)
  .patch(authMiddleware, uploadMiddleware.single("car"), CarController.update)
  .delete(authMiddleware, CarController.delete);

router
  .route("/cars/:category")
  .get(authMiddleware, CarController.getByCategory);

export default router;
