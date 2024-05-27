import Banner from "../models/Banner.js";

import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Card from "../models/Card.js";
import paginate from "../utils/paginate.js";

// card
export const getCards = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;

  [("select", "sort", "page", "limit")].forEach((el) => delete req.query[el]);
  const pagination = await paginate(page, limit, Banner);

  const cards = await Card.find(req.query)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: cards.length,
    data: cards,
    pagination,
  });
});

export const getCard = asyncHandler(async (req, res, next) => {
  const card = await Card.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: card,
  });
});

export const getOwnCard = asyncHandler(async (req, res, next) => {
  const card = await Card.findById(req.userId);

  res.status(200).json({
    success: true,
    data: card,
  });
});

export const createCard = asyncHandler(async (req, res, next) => {
  const card = await Card.create(req.body);

  res.status(200).json({
    success: true,
    data: card,
  });
});

export const deleteCard = asyncHandler(async (req, res, next) => {
  const card = await Card.findById(req.params.id);

  if (!card) {
    throw new MyError(req.params.id + " ID-тэй байхгүй байна.", 404);
  }

  if (req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);

  card.remove();

  res.status(200).json({
    success: true,
    data: card,
    whoDeleted: user.name,
  });
});

export const updateCard = asyncHandler(async (req, res, next) => {
  const card = await Card.findById(req.params.id);

  if (!card) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  if (card.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    card[attr] = req.body[attr];
  }

  card.save();

  res.status(200).json({
    success: true,
    data: card,
  });
});
