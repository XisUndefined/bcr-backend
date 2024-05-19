import express from "express";
import OrderController from "../controllers/OrderController.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import AuthController from "../controllers/AuthController.js";

const router = express.Router();

router
  .route("/")
  .get(AuthController.protect, OrderController.getOrders)
  .post(AuthController.protect, OrderController.createOrder);

router
  .route("/:orderId")
  .get(
    AuthController.protect, // optional
    OrderController.getOrderById
  )
  .patch(
    AuthController.protect,
    uploadMiddleware.single("order"),
    OrderController.updateOrderById
  );

export default router;
