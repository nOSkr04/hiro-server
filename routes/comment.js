import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getComments,
  getComment,
  createComment,
  deleteComment,
  updateComment,
} from "../controller/comment.js";

const router = express.Router();

//"/Categories"
router
  .route("/")
  .get(getComments)
  .post(protect, authorize("admin", "operator"), createComment);

router
  .route("/:id")
  .get(getComment)
  .delete(protect, authorize("admin", "operator"), deleteComment)
  .put(protect, authorize("admin", "operator"), updateComment);

export default router;
