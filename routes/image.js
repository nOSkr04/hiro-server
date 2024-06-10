import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import { uploadClientPhoto, changeUrl } from "../controller/image.js";

const router = express.Router();

router.route("/upload/:type").post(uploadClientPhoto);
router.route("/changeUrl").post(changeUrl);
export default router;
