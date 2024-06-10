import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getHomeScreen,
  createHomeScreen,
  updateHomeScreen,
} from "../controller/homeScreen.js";

const router = express.Router();

//"/HomeScreen"
router
  .route("/")
  .get(getHomeScreen)
  .post(protect, authorize("admin", "operator"), createHomeScreen);

router
  .route("/:id")
  .put(protect, authorize("admin", "operator"), updateHomeScreen);

export default router;
