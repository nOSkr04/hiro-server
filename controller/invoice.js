import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import Invoice from "../models/Invoice.js";

export const getInvoices = asyncHandler(async (req, res, next) => {
  const filters = {};

  const page = parseInt(req.query.page, 10) - 1 || 0;
  const limit = parseInt(req.query.limit, 10) || 10;
  const filter = req.query.filter || {};
  if (filter?.query && filter?.query !== "") {
    filters.$or = [
      {
        phone: { $regex: `${filter?.query}`, $options: "i" },
      },
    ];
  }
  const countDocuments = await Invoice.countDocuments(filters);
  const invoice = await Invoice.find(filters)
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit)
    .populate({
      model: "User",
      path: "createUser",
    });
  res.status(200).json({
    success: true,
    data: invoice,
    count: countDocuments,
  });
});

export const getInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    throw new MyError(req.params.id + " ID-тай invoice олдсонгүй.", 400);
  }

  // invoice.name += "-"
  // invoice.save(function (err) {
  // if (err) console.log("error: ", err)
  // console.log("saved...")
  // })
  res.status(200).json({ success: true, data: invoice });
});

export const getCvInvoice = asyncHandler(async (req, res, next) => {
  req.query.invoice = req.params.cvId;
  return this.getInvoices(req, res, next);
});

export const createInvoice = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId;
  req.body.apply = req.params.id;
  const invoice = await Invoice.create(req.body);

  res.status(200).json({ success: true, data: invoice });
});

export const updateInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!invoice) {
    return res.status(400).json({
      success: false,
      error: req.params.id + " ID-тай invoice байхгүй.",
    });
  }
  res.status(200).json({ success: true, data: invoice });
});

export const deleteInvoice = asyncHandler(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return res.status(400).json({
      success: false,
      error: req.params.id + " ID-тай invoice байхгүй.",
    });
  }
  invoice.remove();
  res.status(200).json({ success: true, data: invoice });
});
