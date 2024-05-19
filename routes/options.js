import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getOptions,
  getOption,
  createOption,
  deleteOption,
  updateOption,
} from "../controller/options.js";

const router = express.Router();

//"/options"
router
  .route("/")
  .get(getOptions)
  .post(protect, authorize("admin", "operator"), createOption);

router
  .route("/:id")
  .get(getOption)
  .delete(protect, authorize("admin", "operator"), deleteOption)
  .put(protect, authorize("admin", "operator"), updateOption);

export default router;
