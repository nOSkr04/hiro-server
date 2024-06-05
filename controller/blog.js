import Product from "../models/Product.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";
import Blog from "../models/Blog.js";
import HomeScreen from "../models/HomeScreen.js";

// /products
export const getBlogs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Product);

  const blog = await Blog.find(req.query)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: blog.length,
    data: blog,
    pagination,
  });
});

export const getBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }
  blog.seen += 1;
  blog.save();

  res.status(200).json({
    success: true,
    data: blog,
  });
});

export const createBlog = asyncHandler(async (req, res, next) => {
  const homeScreen = await HomeScreen.findOne({});
  if (!homeScreen) {
    throw new MyError(
      "HomeScreen-д хамгийн сүүлийн блогийг харуулахад алдаа гарлаа.",
      404
    );
  }
  const blog = await Blog.create(req.body);
  if (homeScreen.blogs.length > 4) {
    homeScreen.blogs.shift();
  }
  homeScreen.blogs.push(blog._id);
  await homeScreen.save();

  res.status(200).json({
    success: true,
    data: blog,
  });
});

export const deleteBlog = asyncHandler(async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      throw new MyError(req.params.id + " ID-тэй blog байхгүй байна.", 404);
    }
    const homeScreen = await HomeScreen.findOne({});
    if (req.userRole !== "admin") {
      throw new MyError("Та зөвхөн өөрийнхөө blog л засварлах эрхтэй", 403);
    }

    const user = await User.findById(req.userId);
    homeScreen.blogs = homeScreen.blogs.filter(
      (item) => item.toString() !== blog._id.toString()
    );
    await homeScreen.save();
    await blog.remove();

    res.status(200).json({
      success: true,
      data: blog,
      whoDeleted: user.name,
    });
  } catch (error) {
    next(error);
  }
});

export const updateBlog = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new MyError(req.params.id + " ID-тэй blog байхгүйээээ.", 400);
  }
  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    blog[attr] = req.body[attr];
  }

  blog.save();

  res.status(200).json({
    success: true,
    data: blog,
  });
});
