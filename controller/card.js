import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Card from "../models/Card.js";
import ProductVariant from "../models/ProductVariant.js";

// card
export const getCards = asyncHandler(async (req, res, next) => {
  const filters = { type: { $ne: "ARCHIVED" } };
  const page = parseInt(req.query.page, 10) - 1 || 0;
  const limit = parseInt(req.query.limit, 10) || 10;
  const filter = req.query.filter || {};
  if (filter.userId) {
    const user = await User.findById(filter.userId);
    if ( !user ) {
      throw new MyError("Таны хайсан хэрэглэгч олдсонгүй.", 400);
    }
    filters.user = user
  }

  const countDocuments = await Card.countDocuments(filters);
  const cards = await Card.find(filters)
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit)
    .populate([
      {
        model: "ProductVariant",
        path : "productVariant",
        populate: [
          {
            model: "Product",
            path : "product",
          },
        ]
      },
    ]);

  res.status(200).json({
    success: true,
    count: countDocuments,
    data: cards,
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
  console.log("req.userId", req.userId);
  const card = await Card.find({ user: req.userId });

  res.status(200).json({
    success: true,
    data: card,
  });
});

export const createCard = asyncHandler(async (req, res, next) => {
  const productVariant = await ProductVariant.findById(req.body.productVariant);
  if (!productVariant || productVariant.quantity < req.body.quantity) {
    throw new MyError("Таны сонгосон бараа байхгүй байна.", 400);
  }
  if(productVariant.quantity < 1){
    throw new MyError("Таны сонгосон бараа байхгүй байна.", 400);
  }
  if( req.body.quantity < 1){
    req.body.quantity = 1;
  }
  req.body.price = productVariant.price;
  req.body.totalPrice = productVariant.price * req.body.quantity;
  const card = await Card.create(req.body);
  if (!card.user) {
    card.user = req.userId;
  }
  card.type = "NEW";
  card.save();

  // productVariant.quantity -= req.body.quantity;
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

  if (req.userRole !== "admin" || card.createUser.toString() !== req.userId) {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }
  // const productVariant = await ProductVariant.findById(card.productVariant);
  // productVariant.quantity += card.quantity;
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
