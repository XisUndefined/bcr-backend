import express from "express";
import UserController from "../controllers/UserController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import CarController from "../controllers/CarController.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import OrderController from "../controllers/OrderController.js";

const router = express.Router();

router
  .route("/auth/signup")
  .post(authMiddleware, adminMiddleware, UserController.signup);

router
  .route("/cars")
  .get(authMiddleware, adminMiddleware, CarController.getCars)
  .post(
    authMiddleware,
    adminMiddleware,
    uploadMiddleware.single("car"),
    CarController.create
  );

router
  .route("/cars/:id")
  .get(authMiddleware, adminMiddleware, CarController.getById)
  .patch(
    authMiddleware,
    adminMiddleware,
    uploadMiddleware.single("car"),
    CarController.update
  )
  .delete(authMiddleware, adminMiddleware, CarController.delete);

router
  .route("/cars/:category")
  .get(authMiddleware, adminMiddleware, CarController.getByCategory);

router
  .route("/order")
  .get(authMiddleware, adminMiddleware, OrderController.adminList);

router
  .route("/order/:orderId")
  .get(authMiddleware, adminMiddleware, OrderController.adminGetOrderById)
  .patch(authMiddleware, adminMiddleware, OrderController.updateStatus);

export default router;
