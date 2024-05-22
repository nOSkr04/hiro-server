import path from "path";
import ProductOption from "../models/ProductOption.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Variant from "../models/ProductVariant.js";
// /options
function generateCombinations(arrays, prefix = []) {
  if (arrays.length === 0) {
    return [prefix];
  } else {
    let result = [];
    const firstArray = arrays[0];
    const remainingArrays = arrays.slice(1);
    for (let value of firstArray) {
      result = result.concat(
        generateCombinations(remainingArrays, prefix.concat(value))
      );
    }
    return result;
  }
}

export const getOptions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Option);

  const options = await ProductOption.find(req.query)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: options.length,
    data: options,
    pagination,
  });
});

export const getOption = asyncHandler(async (req, res, next) => {
  const option = await ProductOption.findById(req.params.id);

  if (!option) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  option.seen += 1;
  option.save();

  res.status(200).json({
    success: true,
    data: option,
  });
});

export const createOption = asyncHandler(async (req, res, next) => {
  const id = req.body.productId;
  const values = req.body.values;
  const product = await Product.findById(id);
  if (!product) {
    throw new MyError(id + " ID-тэй бараа байхгүй байна.", 404);
  }
  const option = await Option.create(req.body);
  product.set({
    options: [...(product.options || []), option._id],
  });
  await product.save();

  const oldVariants = await Variant.find({ product: id });
  if (oldVariants.length > 0) {
    oldVariants.forEach(async (variant) => {
      await variant.deleteOne();
    });
  }
  const options = ProductOption.find({ product: req.body.productId }).populate([
    {
      model: "Product",
      path: "product",
    },
    {
      model: "Variant",
      path: "variant",
    },
  ]);
  const nestedValues = options.map((item) => item.values);

  const combinations = generateCombinations(nestedValues);
  combinations.map(async (val) => {
    await new Variant({
      name: val.join("/"),
      price: product.price,
      product: product,
      type: "DEFAULT",
    }).save();
  });

  res.status(200).json({
    success: true,
    data: option,
  });
});

export const deleteOption = asyncHandler(async (req, res, next) => {
  const option = await ProductOption.findById(req.params.id);

  if (!option) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);

  option.remove();

  const options = await ProductOption.find({ parentId: req.params.parentId });
  //check options values
  options;
  res.status(200).json({
    success: true,
    data: option,
    whoDeleted: user.name,
  });
});

export const updateOption = asyncHandler(async (req, res, next) => {
  const option = await ProductOption.findById(req.params.id);

  if (!option) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  if (option.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    option[attr] = req.body[attr];
  }

  option.save();

  res.status(200).json({
    success: true,
    data: option,
  });
});
