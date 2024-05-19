import express from "express";
import CarController from "../controllers/CarController.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import AuthController from "../controllers/AuthController.js";

const router = express.Router();

router
  .route("/")
  .get(
    AuthController.protect,
    AuthController.verifyAdmin,
    CarController.getCars
  )
  .post(
    AuthController.protect,
    AuthController.verifyAdmin,
    uploadMiddleware.single("car"),
    CarController.createCar
  );

router.route("/search").get(CarController.getCars);

router
  .route("/:id")
  .get(CarController.getCarById)
  .patch(
    AuthController.protect,
    AuthController.verifyAdmin,
    uploadMiddleware.single("car"),
    CarController.updateCarById
  )
  .delete(
    AuthController.protect,
    AuthController.verifyAdmin,
    uploadMiddleware.single("car"),
    CarController.deleteCarById
  );

export default router;
