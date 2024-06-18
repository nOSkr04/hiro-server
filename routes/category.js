import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getCategories,
  getCategory,
  createCategory,
  deleteCategory,
  updateCategory,
  deleteCaution
} from "../controller/category.js";

const router = express.Router();

//"/Categories"
router
  .route("/")
  .get(getCategories)
  .post(protect, authorize("admin", "operator"), createCategory);

router.route("/deleteCaution/:id").get(deleteCaution);
router
  .route("/:id")
  .get(getCategory)
  .delete(protect, authorize("admin", "operator"), deleteCategory)
  .put(protect, authorize("admin", "operator"), updateCategory);

export default router;
