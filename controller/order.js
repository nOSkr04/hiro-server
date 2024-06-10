import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { or } from "sequelize";
import Card from "../models/Card.js";
import Invoice from "../models/Invoice.js";
// /products
export const getOrders = asyncHandler(async (req, res, next) => {
  const filters = {};

  const page = parseInt(req.query.page, 10) - 1 || 0;
  const limit = parseInt(req.query.limit, 10) || 10;
  const filter = req.query.filter || {};

  if (filter?.select && filter?.select !== "") {
    filters.$or = [
      {
        name: { $regex: `${filter?.select}`, $options: "i" },
      },
      {
        email: { $regex: `${filter?.select}`, $options: "i" },
      },
      {
        phone: { $regex: `${filter?.select}`, $options: "i" },
      },
      {
        price: { $regex: `${filter?.select}`, $options: "i" },
      },
    ];
  }

  const countDocuments = await Order.countDocuments(filters);
  const rows = await Order.find(filters)
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
    data: rows,
  });
});

export const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({
    model: "Product",
    path: "products",
  });

  if (!order) {
    throw new MyError(req.params.id + " ID-тэй захиалга байхгүй байна.", 400);
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const createOrder = asyncHandler(async (req, res, next) => {
  const cardsId = req.body.cards;
  const cards = await Card.find({ _id: { $in: cardsId } });
  console.log("cards", cards);
  const user = await User.findById(req.userId);
  if (!user) {
    throw new MyError("Хэрэглэгч олдсонгүй.", 400);
  }
  if (!cards) {
    throw new MyError("Бараа сонгоно уу.", 400);
  }
  if (cards.length === 0) {
    throw new MyError("Бараа сонгоно уу.", 400);
  }

  const total = cards.reduce((acc, item) => {
    return acc + item.price * item.quantity * 1;
  }, 0);
  const quantity = cards.reduce((acc, item) => {
    return acc + item.quantity * 1;
  }, 0);
  console.log("aaaaaa", total);
  req.body.price = total;
  req.body.user = req.userId;
  req.body.name = user.name;
  req.body.email = user.email;
  req.body.phone = user.phone;
  req.body.address = user.address;
  req.body.status = "pending";
  req.body.payment = "unpaid";
  req.body.quantity = quantity;
  const feature = await Order.create(req.body);

  res.status(200).json({
    success: true,
    data: feature,
  });
});

export const deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  const user = await User.findById(req.userId);
  if (!user) {
    throw new MyError("Хэрэглэгч олдсонгүй.", 400);
  }
  if (!order) {
    throw new MyError(req.params.id + "Алдаа гарлаа!", 404);
  }
  if (order.user.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө захиалгыг устгах эрхтэй", 403);
  }
  if (order.status === "completed") {
    throw new MyError("Захиалга баталгаажсан тул устгах боломжгүй", 403);
  }
  if (order.status === "cancelled") {
    throw new MyError("Захиалга цуцлагдсан тул устгах боломжгүй", 403);
  }
  await order.remove();
  res.status(200).json({
    success: true,
    data: feature,
    whoDeleted: user.name,
  });
});

export const updateOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new MyError(req.params.id + " ID-тэй тодорхойлолт байхгүйээээ.", 400);
  }
  if (order.status === "completed") {
    throw new MyError("Захиалга баталгаажсан тул засварлах боломжгүй", 403);
  }
  if (order.status === "cancelled") {
    throw new MyError("Захиалга цуцлагдсан тул засварлах боломжгүй", 403);
  }
  if (order.user.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө захиалгыг засварлах эрхтэй", 403);
  }

  for (let attr in req.body) {
    feature[attr] = req.body[attr];
  }

  order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});
export const invoiceTime = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({
    model: "User",
    path: "user",
  });
  if (!order) {
    throw new MyError("Захиалга олдсонгүй", 400);
  }
  await axios({
    method: "post",
    url: "https://merchant.qpay.mn/v2/auth/token",
    headers: {
      Authorization: `Basic U0FOVEFfTU46Z3F2SWlKSnI=`,
    },
  })
    .then((response) => {
      const token = response.data.access_token;

      axios({
        method: "post",
        url: "https://merchant.qpay.mn/v2/invoice",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          invoice_code: "HIRO_MN_INVOICE",
          sender_invoice_no: "06149906",
          invoice_receiver_code: `${order.user.phone}`,
          invoice_description: `hiro access ${order.user.phone}`,
          amount: order.price,
          callback_url: `https://santa.mn/users/callbacks/${req.params.id}/${order.user.phone}`,
        },
      })
        .then(async (response) => {
          req.body.urls = response.data.urls;
          req.body.qrImage = response.data.qr_image;
          req.body.invoiceId = response.data.invoice_id;
          const invoice = await Invoice.create(req.body);
          order.invoice = invoice._id;
          order.save();
          res.status(200).json({
            success: true,
            data: invoice,
          });
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    })
    .catch((error) => {
      console.log(error.response.data);
    });
});

export const invoiceCheck = asyncHandler(async (req, res) => {
  await axios({
    method: "post",
    url: "https://merchant.qpay.mn/v2/auth/token",
    headers: {
      Authorization: `Basic U0FOVEFfTU46Z3F2SWlKSnI=`,
    },
  })
    .then((response) => {
      const token = response.data.access_token;
      axios({
        method: "post",
        url: "https://merchant.qpay.mn/v2/payment/check",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          object_type: "INVOICE",
          object_id: req.params.id,
          page_number: 1,
          page_limit: 100,
          callback_url: `https://santa.mn/users/check/challbacks/${req.params.id}/${req.params.numId}`,
        },
      })
        .then(async (response) => {
          const order = await Order.findById(req.params.orderId);
          if (!order) {
            throw new MyError("Захиалга олдсонгүй", 400);
          }
          const count = response.data.count;
          if (count === 0) {
            res.status(402).json({
              success: false,
            });
          } else {
            // const price = parseInt(req.params.numId, 10);
            order.payment = "paid";
            order.isPayment = true;
            await order.save();
            // await Notification.create({
            //   title: `Үйлчилгээний эрх нээгдлээ`,
            //   users: profile._id,
            // });
            // if (profile.expoPushToken) {
            //   await sendNotification(
            //     profile.expoPushToken,
            //     "Үйлчилгээний эрх нээгдлээ"
            //   );
            // }
            // }
            res.status(200).json({
              success: true,
              data: order,
            });
          }
        })
        .catch((error) => {
          // console.log(error, "error");
        });
    })
    .catch((error) => {
      console.log(error);
    });
});

export const chargeTime = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  const price = parseInt(req.params.numId, 10);
  // if (price === 100) {
  order.isPayment = true;
  order.save();
  // await order.updateOne(
  //   { _id: order._id },
  //   { $inc: { notificationCount: 1 } }
  // );
  // if (profile.expoPushToken) {
  //   await sendNotification(profile.expoPushToken, `Үйлчилгээний эрх нээгдлээ`);
  // }

  // await Notification.create({
  //   title: `Үйлчилгээний эрх нээгдлээ`,
  //   users: profile._id,
  // });
  // }
  res.status(200).json({
    success: true,
    data: profile,
  });
});
