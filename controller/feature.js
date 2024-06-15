import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Feature from "../models/Feature.js";
import HomeScreen from "../models/HomeScreen.js";

// /products
export const getFeatures = asyncHandler(async (req, res, next) => {
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

  const countDocuments = await Feature.countDocuments(filters);
  const feature = await Feature.find(filters)
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit)
    .populate([
      {
        model: "Product",
        path: "products",
      },
      {
        model: "Image",
        path: "images",
      },
      {
        model: "Image",
        path: "icon",
      },
    ]);

  res.status(200).json({
    success: true,
    count: countDocuments,
    data: feature,
  });
});

export const getFeature = asyncHandler(async (req, res, next) => {
  const feature = await Feature.findById(req.params.id).populate([
    {
      model: "Product",
      path: "products",
    },
    {
      model: "Image",
      path: "images",
    },
    {
      model: "Image",
      path: "icon",
    },
  ]);

  if (!feature) {
    throw new MyError(
      req.params.id + " ID-тэй тодорхойлолт байхгүй байна.",
      400
    );
  }

  res.status(200).json({
    success: true,
    data: feature,
  });
});

export const createFeature = asyncHandler(async (req, res, next) => {
  const feature = await Feature.create(req.body);

  if (req.body.isHomeScreen) {
    const homeScreen = await HomeScreen.findOne({});
    if (!homeScreen) {
      throw new MyError(
        "HomeScreen-д  оруулахын тулд HomeScreen үүсгэнэ үү.",
        400
      );
    }
    if (homeScreen.features.length > 6) {
      throw new MyError(
        "HomeScreen-д тодорхойлолтын тоо хязгаарлагдсан байна.",
        400
      );
    }
    homeScreen.features.push(feature._id);
    await homeScreen.save();
  }

  res.status(200).json({
    success: true,
    data: feature,
  });
});

export const deleteFeature = asyncHandler(async (req, res, next) => {
  const feature = await Feature.findById(req.params.id);

  if (!feature) {
    throw new MyError(
      req.params.id + " ID-тэй тодорхойлолт байхгүй байна.",
      404
    );
  }

  if (req.userRole !== "admin") {
    throw new MyError(
      "Та зөвхөн өөрийнхөө тодорхойлолт л засварлах эрхтэй",
      403
    );
  }

  const user = await User.findById(req.userId);
  const homeScreen = await HomeScreen.findOne({});
  if (homeScreen && feature.isHomeScreen) {
    homeScreen.features = homeScreen.features.filter(
      (id) => id.toString() !== req.params.id
    );
    await homeScreen.save();
  }
  feature.remove();

  res.status(200).json({
    success: true,
    data: feature,
    whoDeleted: user.name,
  });
});

export const updateFeature = asyncHandler(async (req, res, next) => {
  const feature = await Feature.findById(req.params.id);

  if (!feature) {
    throw new MyError(req.params.id + " ID-тэй тодорхойлолт байхгүйээээ.", 400);
  }

  if (
    feature.createUser.toString() !== req.userId &&
    req.userRole !== "admin"
  ) {
    throw new MyError(
      "Та зөвхөн өөрийнхөө тодорхойлолт л засварлах эрхтэй",
      403
    );
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    feature[attr] = req.body[attr];
  }

  feature.save();

  res.status(200).json({
    success: true,
    data: feature,
  });
});
