import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getBanners,
  getBanner,
  createBanner,
  deleteBanner,
  updateBanner,
  getBannerOptions,
} from "../controller/banner.js";

const router = express.Router();

//"/Banners"
router
  .route("/")
  .get(getBanners)
  .post(protect, authorize("admin", "operator"), createBanner);

router.route("/options").get(getBannerOptions);
router
  .route("/:id")
  .get(getBanner)
  .delete(protect, authorize("admin", "operator"), deleteBanner)
  .put(protect, authorize("admin", "operator"), updateBanner);

export default router;
