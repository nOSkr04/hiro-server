import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getInstagrams,
  getInstagram,
  createInstagram,
  deleteInstagram,
  updateInstagram,
} from "../controller/instagram.js";

const router = express.Router();

//"/Features"
router
  .route("/")
  .get(getInstagrams)
  .post(protect, authorize("admin", "operator"), createInstagram);

router
  .route("/:id")
  .get(getInstagram)
  .delete(protect, authorize("admin", "operator"), deleteInstagram)
  .put(protect, authorize("admin", "operator"), updateInstagram);

export default router;
