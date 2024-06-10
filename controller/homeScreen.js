import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import HomeScreen from "../models/HomeScreen.js";
import { path } from "@ffmpeg-installer/ffmpeg";

// /homeScreen
export const getHomeScreen = asyncHandler(async (req, res, next) => {
  const homeScreen = await HomeScreen.findOne().populate([
    {
      model: "Category",
      path: "categories",
      populate: [
        {
          model: "Category",
          path: "childCategories",
          populate: {
            model: "Image",
            path: "icon",
          },
        },
        {
          model: "Image",
          path: "icon",
        },
      ],
    },
    {
      model: "Product",
      path: "products",
    },
    {
      model: "Product",
      path: "newProducts",
    },
    {
      model: "Banner",
      path: "banners",
    },
    {
      model: "Feature",
      path: "features",
    },
  ]);

  if (!homeScreen) {
    throw new MyError(req.params.id + " ID-тэй хоосон байна.", 404);
  }

  res.status(200).json({
    success: true,
    data: homeScreen,
  });
});

export const createHomeScreen = asyncHandler(async (req, res, next) => {
  const homeScreen = await HomeScreen.create(req.body);

  res.status(200).json({
    success: true,
    data: homeScreen,
  });
});

export const updateHomeScreen = asyncHandler(async (req, res, next) => {
  const homeScreen = await HomeScreen.findById(req.params.id);

  if (!homeScreen) {
    throw new MyError(req.params.id + " ID-тэй байхгүйээээ.", 400);
  }

  if (
    homeScreen.createUser.toString() !== req.userId &&
    req.userRole !== "admin"
  ) {
    throw new MyError("Та зөвхөн өөрийнхөө л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    homeScreen[attr] = req.body[attr];
  }

  homeScreen.save();

  res.status(200).json({
    success: true,
    data: homeScreen,
  });
});
