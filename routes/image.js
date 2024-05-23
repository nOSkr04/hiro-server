import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  uploadClientPhoto,
} from "../controller/image.js";

const router = express.Router();

router.route("/upload/:type").post(uploadClientPhoto);

export default router;
