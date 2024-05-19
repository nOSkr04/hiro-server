import path from "path";
import Product from "../models/Product.js";

import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";

// /products
export const getProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Product);

  const products = await Product.find(req.query)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
    pagination,
  });
});

export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  product.seen += 1;
  product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});

export const createProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    data: product,
  });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);

  product.remove();

  res.status(200).json({
    success: true,
    data: product,
    whoDeleted: user.name,
  });
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  if (
    product.createUser.toString() !== req.userId &&
    req.userRole !== "admin"
  ) {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    product[attr] = req.body[attr];
  }

  product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});
