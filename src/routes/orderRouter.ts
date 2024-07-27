import express from "express";
import OrderController from "../controllers/OrderController.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(authMiddleware, OrderController.customerList)
  .post(authMiddleware, OrderController.create);

router
  .route("/:orderId")
  .get(authMiddleware, OrderController.customerGetOrderById)
  .patch(
    authMiddleware,
    uploadMiddleware.single("slip"),
    OrderController.updateFile
  );

export default router;
