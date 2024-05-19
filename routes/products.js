import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getProducts,
  getProduct,
  createProduct,
  deleteProduct,
  updateProduct,
} from "../controller/products.js";

const router = express.Router();

//"/products"
router
  .route("/")
  .get(getProducts)
  .post(protect, authorize("admin", "operator"), createProduct);

router
  .route("/:id")
  .get(getProduct)
  .delete(protect, authorize("admin", "operator"), deleteProduct)
  .put(protect, authorize("admin", "operator"), updateProduct);

export default router;
