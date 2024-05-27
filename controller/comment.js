import Category from "../models/Category.js";

import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import User from "../models/User.js";

// /products
export const getComments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) - 1 || 0;
  const limit = parseInt(req.query.limit, 10) || 10;

  const filter = req.query.filter || {};
  const countDocuments = await Comment.countDocuments(filter);
  const comment = await Comment.find(filter)
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit);


  res.status(200).json({
    success: true,
    count: countDocuments,
    data: comment,
  });
});

export const getComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: comment,
  });
});

export const createComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.create(req.body);

  res.status(200).json({
    success: true,
    data: comment,
  });
});

export const deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new MyError("Коммент олдсонгүй!.", 404);
  }

  if (req.userRole !== "admin" || comment.user.toString() !== req.userId) {
    throw new MyError("Та зөвхөн өөрийнхөө комментыг л устгах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);

  await comment.remove();

  res.status(200).json({
    success: true,
    data: comment,
    whoDeleted: user.name,
  });
});

export const updateComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new MyError("Коммент олдсонгүй!.", 404);
  }

  if ( req.userRole !== "admin" || comment.user.toString() !== req.userId ) {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    comment[attr] = req.body[attr];
  }

  await comment.save();

  res.status(200).json({
    success: true,
    data: comment,
  });
});
