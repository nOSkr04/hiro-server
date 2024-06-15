import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getVariants,
  getVariant,
  createVariant,
  deleteVariant,
  updateVariant,
  updateManyVariants,
} from "../controller/variant.js";

const router = express.Router();

//"/products"
router
  .route("/")
  .get(getVariants)
  .post(protect, authorize("admin", "operator"), createVariant);

router.route("/updateMany").put(protect, authorize("admin"), updateManyVariants);
router
  .route("/:id")
  .get(getVariant)
  .delete(protect, authorize("admin", "operator"), deleteVariant)
  .put(protect, authorize("admin", "operator"), updateVariant);

export default router;
