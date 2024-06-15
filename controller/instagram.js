import Product from "../models/Product.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";
import Instagram from "../models/Instagram.js";
import HomeScreen from "../models/HomeScreen.js";

// /products
export const getInstagrams = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Product);

  const insta = await Instagram.find(req.query)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: insta.length,
    data: insta,
    pagination,
  });
});

export const getInstagram = asyncHandler(async (req, res, next) => {
  const insta = await Instagram.findById(req.params.id);

  if (!insta) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }
  insta.seen += 1;
  insta.save();

  res.status(200).json({
    success: true,
    data: insta,
  });
});

export const createInstagram = asyncHandler(async (req, res, next) => {
  const homeScreen = await HomeScreen.findOne({});
  const insta = await Instagram.create(req.body);

  if (homeScreen.instagrams.length > 4) {
    homeScreen.instagrams.shift();
  }
  homeScreen.instagrams.push(insta._id);
  await homeScreen.save();

  res.status(200).json({
    success: true,
    data: insta,
  });
});

export const deleteInstagram = asyncHandler(async (req, res, next) => {
  try {
    const insta = await Instagram.findById(req.params.id);

    if (!insta) {
      throw new MyError(req.params.id + " ID-тэй insta байхгүй байна.", 404);
    }
    const homeScreen = await HomeScreen.findOne({});
    if (req.userRole !== "admin") {
      throw new MyError("Та зөвхөн өөрийнхөө insta л засварлах эрхтэй", 403);
    }

    const user = await User.findById(req.userId);
    homeScreen.instagrams = homeScreen.instagrams.filter(
      (item) => item.toString() !== insta._id.toString()
    );
    await homeScreen.save();

    await insta.remove();

    res.status(200).json({
      success: true,
      data: insta,
      whoDeleted: user.name,
    });
  } catch (error) {
    next(error);
  }
});

export const updateInstagram = asyncHandler(async (req, res, next) => {
  const insta = await Instagram.findById(req.params.id);

  if (!insta) {
    throw new MyError(req.params.id + " ID-тэй insta байхгүйээээ.", 400);
  }
  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    insta[attr] = req.body[attr];
  }

  insta.save();

  res.status(200).json({
    success: true,
    data: insta,
  });
});
