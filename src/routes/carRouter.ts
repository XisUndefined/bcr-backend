import express from "express";
import CarController from "../controllers/CarController.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import AuthController from "../controllers/AuthController.js";

const router = express.Router();

router
  .route("/")
  .get(AuthController.protect, CarController.getCars)
  .post(
    AuthController.protect,
    uploadMiddleware.single("car"),
    CarController.createCar
  );

router.route("/search").get(CarController.getCars);

router
  .route("/:id")
  .get(CarController.getCarById)
  .patch(
    AuthController.protect,
    uploadMiddleware.single("car"),
    CarController.updateCarById
  )
  .delete(
    AuthController.protect,
    uploadMiddleware.single("car"),
    CarController.deleteCarById
  );

router
  .route("/:category")
  .get(AuthController.protect, CarController.getCarByCategory);

export default router;
