import { Router } from "express";
import { uploadPhoto } from "../controller/media.js";

const router = Router();

router.route("/photo").post(uploadPhoto);

export default router;
