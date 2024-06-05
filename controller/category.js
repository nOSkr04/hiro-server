import Category from "../models/Category.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// /products
export const getCategories = asyncHandler(async (req, res, next) => {
  const filters = {};

  const page = parseInt(req.query.page, 10) - 1 || 0;
  const limit = parseInt(req.query.limit, 10) || 10;
  const filter = req.query.filter || {};

  if (filter?.select && filter?.select !== "") {
    filters.$or = [
      {
        name: { $regex: `${filter?.select}`, $options: "i" },
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
    },
    {
      model: "Category",
      path: "parentCategory",
    },
  ]);

  if (!category) {
    throw new MyError(req.params.id + " ID-тэй категори байхгүй байна.", 404);
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  if (req.body.parentCategory) {
    const parentCategory = await Category.findById(req.body.parentCategory);
    if (!parentCategory) {
      throw new MyError("Эх категори байхгүй байна.", 400);
    }
    parentCategory.childCategories.push(category._id);
    parentCategory.save();
  }
  res.status(200).json({
    success: true,
    data: category,
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
