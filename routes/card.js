import express from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getCards,
  getCard,
  createCard,
  deleteCard,
  updateCard,
  getOwnCard,
} from "../controller/card.js";

const router = express.Router();

//"/Banners"
router.route("/").get(getCards).post(protect, createCard);
router.route("/me").get(protect, getOwnCard);
router
  .route("/:id")
  .get(getCard)
  .delete(protect, authorize("admin", "operator"), deleteCard)
  .put(protect, authorize("admin", "operator"), updateCard);

export default router;
