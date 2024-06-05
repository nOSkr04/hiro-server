import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getBlogs,
  getBlog,
  createBlog,
  deleteBlog,
  updateBlog,
} from "../controller/blog.js";

const router = express.Router();

//"/Features"
router
  .route("/")
  .get(getBlogs)
  .post(protect, authorize("admin", "operator"), createBlog);

router
  .route("/:id")
  .get(getBlog)
  .delete(protect, authorize("admin", "operator"), deleteBlog)
  .put(protect, authorize("admin", "operator"), updateBlog);

export default router;
