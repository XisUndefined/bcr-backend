import express from "express";
import CarController from "../controllers/CarController.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(authMiddleware, CarController.getCars)
  .post(authMiddleware, uploadMiddleware.single("car"), CarController.create);

router.route("/search").get(CarController.search);

router
  .route("/:id")
  .get(CarController.getById)
  .patch(authMiddleware, uploadMiddleware.single("car"), CarController.update)
  .delete(authMiddleware, uploadMiddleware.single("car"), CarController.delete);

router.route("/:category").get(authMiddleware, CarController.getByCategory);

export default router;
