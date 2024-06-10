import { Router } from "express";
const router = Router();
import { protect, authorize } from "../middleware/protect.js";

import {
  getInvoices,
  getInvoice,
  getCvInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../controller/invoice.js";

//"/api/v1/invoices"
router.route("/").get(getInvoices).post(protect, createInvoice);

router
  .route("/:id")
  .get(getInvoice)
  .put(protect, authorize("admin", "operator"), updateInvoice)
  .delete(protect, authorize("admin"), deleteInvoice);

router.route("/:cvId/invoice").get(protect, authorize("admin"), getCvInvoice);
export default router;
