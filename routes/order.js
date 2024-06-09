import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getOrders,
  getOrder,
  createOrder,
  deleteOrder,
  updateOrder,
} from "../controller/order.js";

const router = express.Router();

//"/options"
router
  .route("/")
  .get(getOrders)
  .post(protect, authorize("admin", "operator"), createOrder);

router
  .route("/:id")
  .get(getOrder)
  .delete(protect, authorize("admin", "operator"), deleteOrder)
  .put(protect, authorize("admin", "operator"), updateOrder);

export default router;
