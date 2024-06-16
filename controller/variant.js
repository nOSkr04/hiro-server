import ProductOption from "../models/ProductOption.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
// variant v1

export const getVariants = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sort = req.query.sort;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, ProductVariant);

  const variants = await ProductVariant.find(req.query)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: variants.length,
    data: variants,
    pagination,
  });
});

export const getVariant = asyncHandler(async (req, res, next) => {
  const variant = await ProductVariant.findById(req.params.id);

  if (!variant) {
    throw new MyError(req.params.id + "Хувилбар одсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: variant,
  });
});

export const createVariant = asyncHandler(async (req, res, next) => {
  const array = req.body.options;
  const productId = req.body.productId;
  // array have [{id,value}]
  const product = await Product.findById(productId);
  if (!product) {
    throw new MyError(id + " ID-тэй бараа байхгүй байна.", 404);
  }
  array.map(async (item) => {
    const option = await ProductOption.findById(item.id);
    if (!option) {
      throw new MyError("Алдаа гарлаа!", 404);
    }
    await option
      .set({
        values: [...option.values, item.value],
      })
      .save();
  });
  const title = array.map((val) => val.value).join("/");

  const variant = await new ProductVariant({
    name: title,
    type: "MANUAL",
    price: req.body.price || 0,
    quantiy: req.body.quantiy || 0,
    firstQuantity: req.body.firstQuantity || 0,
    createUser: req.user,
  }).save();

  product.set({
    variants: [...(product.variants || []), variant._id],
  });
  if (req.body.quantiy > 0) {
    product.set({
      quantiy: product.quantiy + req.body.quantiy,
    });
  }
  await product.save();
  res.status(200).json({
    success: true,
    data: variant,
  });
});

export const deleteVariant = asyncHandler(async (req, res, next) => {
  const variant = await ProductVariant.findById(req.params.id);

  if (!variant) {
    throw new MyError(req.params.id + " ID-тэй  байхгүй байна.", 404);
  }

  if (req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө барааг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);
  const product = await Product.findById(variant.product);
  product.set({
    variants: product.variants.filter((id) => id.toString() !== req.params.id),
  });
  if (variant.quantiy > 0) {
    product.set({
      quantiy: product.quantiy - variant.quantiy,
    });
  }
  await product.save();
  await variant.remove();
  res.status(200).json({
    success: true,
    data: variant,
    whoDeleted: user.name,
  });
});

export const updateVariant = asyncHandler(async (req, res, next) => {
  const variant = await ProductVariant.findById(req.params.id);
  if (!variant) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }
  const variantQuantity = variant.quantity;

  if (
    variant.createUser.toString() !== req.userId &&
    req.userRole !== "admin"
  ) {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    variant[attr] = req.body[attr];
  }

  await variant.save();
  if (req.body.quantity > 0) {
    const product = await Product.findById(variant.product);
    product.set({
      quantity: product.quantity - variantQuantity + req.body.quantity,
    });
    await product.save();
  }
  res.status(200).json({
    success: true,
    data: variant,
  });
});

export const updateManyVariants = asyncHandler(async (req, res, next) => {
  const variantsArray = req.body.values;
  try {
    variantsArray.map(async (item) => {
      const id = item._id;
        const variant = await ProductVariant.findById(id);
        if (!variant) {
          throw new MyError(id + " ID-тэй бараа байхгүй байна.", 404);
        }
        variant.set({
          price: item.price,
          quantity: item.quantity,
          availableForSale: item.quantity > 0 ? true : false,
        });
        await variant.save();
    });
    res.status(200).json({
      success: true,
      data: variantsArray
    });
  } catch (error) {
    next(error);
  }
});