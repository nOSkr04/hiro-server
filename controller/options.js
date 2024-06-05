import path from "path";
import ProductOption from "../models/ProductOption.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import imageSize from "image-size";
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
  const id = req.body.product;
  const product = await Product.findById(id);
  if (!product) {
    throw new MyError(id + " ID-тэй бараа байхгүй байна.", 404);
  }
  if (req.body.values.length === 0) {
    throw new MyError("Сонголтын утга оруулна уу.", 400);
  }
  req.body.values = req.body.values.filter((item) => item !== "");

  const option = await ProductOption.create(req.body);
  product.set({
    options: [...(product.options || []), option._id],
  });
  await product.save();

  const oldVariants = await ProductVariant.find({
    product: id,
    type: "DEFAULT",
  });
  if (oldVariants.length > 0) {
    oldVariants.forEach(async (variant) => {
      await variant.deleteOne();
    });
  }
  const options = await ProductOption.find({ product: id });
  if (!options) {
    throw new MyError(id + " ID-тэй барааны сонголт байхгүй байна.", 404);
  }
  const nestedValues = options.map((item) => item.values);
  if (!nestedValues) {
    throw new MyError(id + " ID-тэй барааны сонголт байхгүй байна.", 404);
  }
  const combinations = generateCombinations(nestedValues);
  let variants = [];
  try {
    combinations.map((val) => {
      const data = new ProductVariant({
        name: val.length > 1 ? val.join("/") : val[0],
        selectedOptions: val.map((item, index) => {
          return { name: options[index].name, value: item };
        }),
        price: product.price ? product.price : 0,
        product: product,
        image: product.images[0] ? product.images[0] : null,
        type: "DEFAULT",
        createUser: req.userId,
      });
      variants.push(data);
    });
  } catch (error) {
    console.log(error);
  }
  if (variants.length > 0) {
    variants.map(async (val) => {
      await val.save();
    });
  }
  res.status(200).json({
    success: true,
    data: option,
  });
});

export const deleteOption = asyncHandler(async (req, res, next) => {
  const option = await ProductOption.findById(req.params.id).populate({
    model: "Product",
    path: "product",
  });

  if (!option) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);
  const productId = option.product._id;

  const product = await Product.findById(productId);
  product.options = product.options.filter(
    (id) => id.toString() !== req.params.id
  );
  await product.save();
  option.remove();

  const oldVariants = await ProductVariant.find({
    product: productId,
    type: "DEFAULT",
  });
  if (oldVariants.length > 0) {
    oldVariants.forEach(async (variant) => {
      await variant.deleteOne();
    });
  }

  const options = await ProductOption.find({
    product: productId.toString(),
  }).populate([
    {
      model: "Product",
      path: "product",
    },
  ]);
  try {
    const nestedValues = options.map((item) => item.values);
    const combinations = generateCombinations(nestedValues);
    let variants = [];
    combinations.map((val) => {
      const data = new ProductVariant({
        name: val.length > 1 ? val.join("/") : val[0],
        price: product.price ? product.price : 0,
        product: product,
        type: "DEFAULT",
        createUser: req.userId,
      });
      variants.push(data);
    });

    if (variants.length > 0) {
      variants.map(async (val) => {
        await val.save();
      });
    }
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({
    success: true,
    data: option,
    whoDeleted: user.name,
  });
});

export const updateOption = asyncHandler(async (req, res, next) => {
  const option = await ProductOption.findById(req.params.id).populate({
    model: "Product",
    path: "product",
  });
  const countValue = option.values.length;
  if (!option) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }
  // if (option.createUser.toString() !== req.userId && req.userRole !== "admin") {
  //   throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  // }

  // req.body.updateUser = req.userId;

  for (let attr in req.body) {
    option[attr] = req.body[attr];
  }

  await option.save();

  if (countValue !== req.body.values.length) {
    const product = await Product.findById(option.product);
    if (!product) {
      throw new MyError(option.product + " ID-тэй бараа байхгүй байна.", 404);
    }

    const oldVariants = await ProductVariant.find({
      product: option.product,
      type: "DEFAULT",
    });
    if (oldVariants.length > 0) {
      oldVariants.forEach(async (variant) => {
        await variant.deleteOne();
      });
    }
    const options = await ProductOption.find({
      product: option.product._id.toString(),
    }).populate([
      {
        model: "Product",
        path: "product",
      },
    ]);
    const nestedValues = options.map((item) => item.values);
    try {
      const combinations = generateCombinations(nestedValues);
      let variants = [];
      combinations.map((val) => {
        const data = new ProductVariant({
          name: val.length > 1 ? val.join("/") : val[0],
          price: product.price ? product.price : 0,
          product: product,
          type: "DEFAULT",
          createUser: req.userId,
        });
        variants.push(data);
      });

      if (variants.length > 0) {
        variants.map(async (val) => {
          await val.save();
        });
      }
    } catch (error) {
      console.log(error);
      throw new MyError("Алдаа гарлаа. Дахин оролдоно уу.", 400);
    }
  }
  res.status(200).json({
    success: true,
    data: option,
  });
});
