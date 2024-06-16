import Banner from "../models/Banner.js";

import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";
import HomeScreen from "../models/HomeScreen.js";
import Product from "../models/Product.js";
import Feature from "../models/Feature.js";
import Category from "../models/Category.js";

// /products
export const getBanners = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Banner);

  const banner = await Banner.find(req.query)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: banner.length,
    data: banner,
    pagination,
  });
});
export const getBannerOptions = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ type: "ACTIVE" }).populate([
    {
      model: "Category",
      path: "category",
    },
    {
      model: "ProductOption",
      path: "options",
    },
    {
      model: "Image",
      path: "images",
    },
  ]);
  const features = await Feature.find({});
  const categories = await Category.find({});
  res.status(200).json({
    success: true,
    data: {
      products: products,
      features: features,
      categories: categories,
    },
  });
});

export const getBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    throw new MyError(req.params.id + " ID-тэй баннэр байхгүй байна.", 404);
  }

  res.status(200).json({
    success: true,
    data: banner,
  });
});

export const createBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.create(req.body);
  if (req.body.isHomeScreen) {
    const homeScreen = await HomeScreen.findOne({});
    if (!homeScreen) {
      throw new MyError(
        "HomeScreen-д баннер оруулахын тулд HomeScreen үүсгэнэ үү.",
        400
      );
    }
    if (homeScreen.banners.length > 6) {
      throw new MyError(
        "HomeScreen-д баннерийн тоо хязгаарлагдсан байна.",
        400
      );
    }
    homeScreen.banners.push(banner._id);
    await homeScreen.save();
  }

  res.status(200).json({
    success: true,
    data: banner,
  });
});

export const deleteBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    throw new MyError(req.params.id + " ID-тэй байхгүй байна.", 404);
  }

  if (req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);
  const homeScreen = await HomeScreen.findOne({});

  if (homeScreen) {
    homeScreen.banners = homeScreen.banners.filter(
      (item) => item.toString() !== req.params.id
    );
    await homeScreen.save();
  }
  banner.remove();

  res.status(200).json({
    success: true,
    data: banner,
    whoDeleted: user.name,
  });
});

export const updateBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  if (banner.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    banner[attr] = req.body[attr];
  }

  banner.save();

  res.status(200).json({
    success: true,
    data: banner,
  });
});
