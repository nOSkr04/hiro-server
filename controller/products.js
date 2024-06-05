import path from "path";
import Product from "../models/Product.js";

import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";
import ProductVariant from "../models/ProductVariant.js";
import ProductOption from "../models/ProductOption.js";
import HomeScreen from "../models/HomeScreen.js";
import Category from "../models/Category.js";

// /products
export const getProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Product);
  // similar products
  const products = await Product.find(req.query)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit)
    .populate([
      {
        model: "User",
        path: "createUser",
      },
      {
        model: "Image",
        path: "thumbnail",
      },
      {
        model: "Image",
        path: "images",
      },
    ]);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
    pagination,
  });
});

export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate([
    {
      model: "Category",
      path: "category",
    },
    {
      model: "User",
      path: "createUser",
    },
    {
      model: "Image",
      path: "thumbnail",
    },
    {
      model: "Image",
      path: "images",
    },
    {
      model: "ProductOption",
      path: "options",
    },
  ]);

  if (!product) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }
  const variants = await ProductVariant.find({ product: req.params.id });
  product.seen += 1;
  product.save();

  const productObj = product.toObject();

  res.status(200).json({
    success: true,
    data: { ...productObj, variants },
  });
});

export const createProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body);
  const homeScreen = await HomeScreen.findOne({});

  if (homeScreen.newProducts.length > 6) {
    homeScreen.newProducts.shift();
    homeScreen.newProducts.push(product._id);
    await homeScreen.save();
  } else {
    homeScreen.newProducts.push(product._id);
    await homeScreen.save();
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    throw new MyError("Та категори сонгоно уу.", 400);
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
    }

    if (req.userRole !== "admin") {
      throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
    }

    const user = await User.findById(req.userId);

    const options = await ProductOption.find({ product: req.params.id });
    if (options.length > 0) {
      await ProductOption.deleteMany({ product: req.params.id });
    }

    const variants = await ProductVariant.find({ product: req.params.id });
    if (variants.length > 0) {
      await ProductVariant.deleteMany({ product: req.params.id });
    }

    await product.remove();

    res.status(200).json({
      success: true,
      data: product,
      whoDeleted: user.name,
    });
  } catch (error) {
    next(error);
  }
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
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
