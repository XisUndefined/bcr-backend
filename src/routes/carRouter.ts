import express from "express";
import CarController from "../controllers/CarController.js";

const router = express.Router();

router.route("/search").get(CarController.search);

router.route("/:id").get(CarController.getById);

export default router;
