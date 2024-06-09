import Product from "../models/Product.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import ProductVariant from "../models/ProductVariant.js";
import ProductOption from "../models/ProductOption.js";
import HomeScreen from "../models/HomeScreen.js";
import Category from "../models/Category.js";

// /products
export const getProducts = asyncHandler(async (req, res, next) => {
  const filters = {};
  const filter = req.query.filter || {};

  const page = parseInt(req.query.page, 10) - 1 || 0;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sort = req.query.sort || { createdAt: -1 };
  if(filter.category) {
    filters.category = filter.category;
  }
  if(filter.min && filter.max) {
    filters.price = { $gte: filter.min, $lte: filter.max };
  }
  if (filter?.query && filter?.query !== "") {
    filters.$or = [
      {
        title: { $regex: `${filter?.query}`, $options: "i" },
      },
    ];
  }
  const countDocuments = await Product.countDocuments(filters);
  const products = await Product.find(filters)
    .sort(sort)
    .skip(page * limit)
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
    count: countDocuments,
    data: products,
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
  const parentCategory = await Category.findOne({ parentCategory: req.body.category });
  if (parentCategory) {
    throw new MyError("Та үндсэн категори сонгоно уу.", 400);
  }
  if (!category) {
    throw new MyError("Та категори сонгоно уу.", 400);
  }
  if(category.parentCategory) {
    await Category.findByIdAndUpdate(category.parentCategory, { $inc: { productCount: 1 } });
  }
  category.productCount += 1;
  await category.save();
  res.status(200).json({
    success: true,
    data: product,
  });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        model: "Category",
        path: "category",
      })

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

    product.category.productCount -= 1;
    await product.category.save();

    if(product.category.parentCategory) {
      await Category.findByIdAndUpdate(product.category.parentCategory, { $inc: { productCount: -1 } });
    }
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
  const product = await Product.findById(req.params.id)
    .populate({
      model: "Category",
      path: "category",
    });
  const productCategory = product.category;
  if (!product) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }
  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    product[attr] = req.body[attr];
  }

  if (req.body.category.toString() !== productCategory._id.toString()) {
    const parent = await Category.findOne({ parentCategory: req.body.category });
    if (parent) {
      throw new MyError("Та үндсэн категори сонгоно уу.", 400);
    }
    await Category.findByIdAndUpdate(productCategory._id.toString(), { $inc: { productCount: -1 } });
    if( productCategory.parentCategory) {
      await Category.findByIdAndUpdate(productCategory.parentCategory, { $inc: { productCount: -1 } });
    }
    await Category.findByIdAndUpdate(req.body.category, { $inc: { productCount: 1 } });
    const parentCategory = await Category.findById(req.body.category);
    if(parentCategory.parentCategory) {
      await Category.findByIdAndUpdate(parentCategory.parentCategory, { $inc: { productCount: 1 } });
    }
  }
  product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});

export const minMaxPrice = asyncHandler(async (req, res, next) => {
  const min = await Product.find({}).sort({ price: 1 }).limit(1);
  const max = await Product.find().sort({ price: -1 }).limit(1);
  const data = {
    min: min[0].price,
    max: max[0].price,
  };
  res.status(200).json({
    success: true,
    data: data,
  });
});