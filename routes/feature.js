import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getFeatures,
  getFeature,
  createFeature,
  deleteFeature,
  updateFeature,
} from "../controller/feature.js";

const router = express.Router();

//"/Features"
router
  .route("/")
  .get(getFeatures)
  .post(protect, authorize("admin", "operator"), createFeature);

router
  .route("/:id")
  .get(getFeature)
  .delete(protect, authorize("admin", "operator"), deleteFeature)
  .put(protect, authorize("admin", "operator"), updateFeature);

export default router;
