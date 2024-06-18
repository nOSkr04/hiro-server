import Category from "../models/Category.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import HomeScreen from "../models/HomeScreen.js";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import ProductOption from "../models/ProductOption.js";
// /category
export const getCategories = asyncHandler(async (req, res, next) => {
  const filters = {};

  const page = parseInt(req.query.page, 10) - 1 || 0;
  const limit = parseInt(req.query.limit, 10) || 10;
  const filter = req.query.filter || {};

  if (filter?.query && filter?.query !== "") {
    filters.$or = [
      {
        name: { $regex: `${filter?.query}`, $options: "i" },
      },
    ];
  }
  console.log("filters", filters);

  const countDocuments = await Category.countDocuments(filters);
  const category = await Category.find(filters)
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit)
    .populate([
      {
        model: "Category",
        path: "childCategories",
      },
      {
        model: "Category",
        path: "parentCategory",
      },
      {
        model: "Image",
        path: "icon",
      },
    ]);

  res.status(200).json({
    success: true,
    count: countDocuments,
    data: category,
  });
});

export const getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate([
    {
      model: "Category",
      path: "childCategories",
      populate: [{ model: "Image", path: "icon" }],
    },
    {
      model: "Category",
      path: "parentCategory",
    },
    {
      model: "Image",
      path: "icon",
    },
  ]);

  if (!category) {
    throw new MyError(req.params.id + " ID-тэй категори байхгүй байна.", 404);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

export const createCategory = asyncHandler(async (req, res, next) => {
  req.body.name = req.body.name.replace(
    req.body.name[0],
    req.body.name[0].toUpperCase()
  );
  req.body.createUser = req.userId;

  const category = await Category.create(req.body);
  if (req.body.parentCategory) {
    const parentCategory = await Category.findById(req.body.parentCategory);
    if (!parentCategory) {
      throw new MyError("Эх категори байхгүй байна.", 400);
    }
    parentCategory.childCategories.push(category._id);
    parentCategory.save();
  } else {
    const homeScreen = await HomeScreen.findOne();
    homeScreen.categories.push(category._id);
    await homeScreen.save();
  }
  res.status(200).json({
    success: true,
    data: category,
  });
});
export const deleteCaution = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new MyError(req.params.id + " ID-тэй категори байхгүй байна.", 404);
  }
  const products = await Product.find({ category: req.params.id });
  const productIds = products.map((product) => product._id);
  const variants = await ProductVariant.find({ product: { $in: productIds } });
  const options = await ProductOption.find({ product: { $in: productIds } });
  res.status(200).json({
    success: true,
    data: {
      products: products,
      productsCount: products.length,
      variantsCount: variants.length,
      optionsCount: options.length,
    },
  });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new MyError(req.params.id + " ID-тэй категори байхгүй байна.", 404);
  }

  if (req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө категори л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);

  category.remove();

  const products = await Product.find({ category: req.params.id });
  products.map(async (product) => {
    product.category = null;
    product.type = "DELETED";
    await product.save();
    const variants = await ProductVariant.find({ product: product._id });
    variants.map(async (variant) => {
      variant.type = "DELETED";
      await variant.save();
    });
    const options = await ProductOption.find({ product: product._id });
    options.map(async (option) => {
      option.type = "DELETED";
      await option.save();
    });
  }
  );
  res.status(200).json({
    success: true,
    data: category,
    whoDeleted: user.name,
  });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new MyError(req.params.id + " ID-тэй категори байхгүйээээ.", 400);
  }

  if (
    category.createUser.toString() !== req.userId &&
    req.userRole !== "admin"
  ) {
    throw new MyError("Та зөвхөн өөрийнхөө категори л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    category[attr] = req.body[attr];
  }

  category.save();

  res.status(200).json({
    success: true,
    data: category,
  });
});
