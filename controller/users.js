import User from "../models/User.js";
import MyError from "../utils/myError.js";
import asyncHandler from "express-async-handler";
import paginate from "../utils/paginate.js";
import sendEmail from "../utils/email.js";
import crypto from "crypto";
import Wallet from "../models/Wallet.js";
// import sendNotification from "../utils/sendNotification.js";
// import Notification from "../models/Notification.js";
import axios from "axios";
export const authMeUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new MyError(req.params.id, 401);
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});
export const userPrivacy = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    text: `
    <p>Үйлчилгээний нөхцөл</p>
    <ol>
    <li>Ерөнхий нөхцөл
    <ol>
    <li>s69.mn апп нь хэрэглэгчид Бэлгийн боловсрол олгох мэдээ мэдээлэл, зураг, контент, сургалт, зөвлөгөө өгөхтэй холбоотой үүсэх харилцааг зохицуулахад оршино.</li>
    <li>Энэхүү нөхцөл нь хэрэглэгч дээрх үйлчилгээг авахаас өмнө хүлээн зөвшөөрч баталгаажуулсны үндсэн дээр хэрэгжинэ.</li>
    <li>Хэрэглэгч 18 нас хүрсэн, эрх зүйн бүрэн чадамжтай байна.</li>
    <li>s69.mn апп дээрх мэдээ мэдээлэл, зураг, контент, сургалт, зөвлөгөөг ашиг олох зорилгоор хуулбарлаж олшруулах, дуурайх, өөр бусад ямар ч зүйлд ашиглахыг хориглоно.</li>
    </ol>
    </li>
    </ol>
    <ol start="2">
    <li>Хэрэглэгчийн бүртгэл
    <ol>
    <li>s69.mn апп-р үйлчлүүлэхдээ хэрэглэгч бүртгүүлсэн байна. Бүртгэлд нэвтрэх нэр, нэвтрэх нууц пин код үүсгэж илгээхийг заасан хүснэгтэд бөглөнө.</li>
    <li>Хэрэглэгчийн мэдээллийн нууцлалыг бид бүрэн хамгаална.</li>
    <li>Хэрэглэгчийн мэдээллийн үнэн зөв, бодит байдалд хэрэглэгч бүрэн хариуцлага хүлээнэ.</li>
    <li>Хэрэглэгч өөрийн үүсгэсэн нэвтрэх нэр болон нэвтрэх пин кодоо мартсан тохиолдолд бид хариуцлага хүлээхгүй.</li>
    </ol>
    </li>
    <li>Төлбөр тооцоо
    <ol>
    <li>Хэрэглэгчийн эрх нээлгэхэд нэг удаагийн төлбөр 20,000₮ /хорин мянган төгрөг/ байна.</li>
    <li>Төлбөр буцаагдахгүй.</li>
    <li>Төлбөрийг QPay шилжүүлгээр хийнэ.</li>
    </ol>
    </li>
    </ol>
    <ol start="4">
    <li>Бусад
    <ol>
    <li>Садар самуун явдалтай тэмцэх тухай хуульд заасан хязгаарлалтын хүрээнд олгох мэдээ мэдээлэл, зураг, контент, зөвлөгөөг танд хүргэх болно.</li>
    </ol>
    </li>
    </ol>
    <p>&nbsp;</p>`,
  });
});

// register
export const register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  const token = user.getJsonWebToken();

  const cookieOption = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("s69-token", token, cookieOption).json({
    success: true,
    token,
    user: user,
  });
});

// логин хийнэ
export const login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  // Оролтыгоо шалгана

  if (!username || !password) {
    throw new MyError("Нэвтрэх нэр болон нууц үйгээ дамжуулна уу", 400);
  }

  // Тухайн хэрэглэгчийн хайна
  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    throw new MyError("Бүртгэлгүй хэрэглэгч байна", 401);
  }

  const ok = await user.checkPassword(password);

  if (!ok) {
    throw new MyError("Нэвтрэх нэр болон нууц үгээ зөв оруулна уу", 401);
  }

  const token = user.getJsonWebToken();

  const cookieOption = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("s69-token", token, cookieOption).json({
    success: true,
    token,
    user: user,
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.userId, {
    isAdult: false,
  });
  const cookieOption = {
    expires: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("s69-token", null, cookieOption).json({
    success: true,
    data: "logged out...",
  });
});

export const getUsers = asyncHandler(async (req, res, next) => {
  const filters = {};
  const page = parseInt(req.query.page, 10) - 1 || 0;
  const limit = parseInt(req.query.limit, 10) || 10;
  const filter = req.query.filter || {};

  if (filter?.select && filter?.select !== "") {
    filters.$or = [
      {
        username: { $regex: `${filter?.select}`, $options: "i" },
      },
      {
        role: { $regex: `${filter?.select}`, $options: "i" },
      },
    ];
  }
  console.log("filters", filters)

  const countUser = await User.countDocuments(filters);
  const users = await User.find(filters)
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit)

  res.status(200).json({
    success: true,
    data: users,
    count: countUser,
  });
});

export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүй!", 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new MyError(req.params.id + " ID-тэй хэрэглэгч байхгүйээээ.", 400);
  }

  user.remove();

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const deleteMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  user.remove();
  res.status(200).json({
    success: true,
    data: user,
  });
});

export const adultVerify = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  user.isAdult = true;
  user.save();
  res.status(200).json({
    success: true,
    data: user,
  });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    throw new MyError(
      "Та нууц үг сэргээх Нэвтрэх нэр хаягаа дамжуулна уу",
      400
    );
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new MyError(req.body.email + " имэйлтэй хэрэглэгч олдсонгүй!", 400);
  }

  const resetToken = user.generatePasswordChangeToken();
  await user.save();

  // await user.save({ validateBeforeSave: false });

  // Имэйл илгээнэ
  const link = `https://s69.mn/changepassword/${resetToken}`;

  const message = `Сайн байна уу<br><br>Та нууц үгээ солих хүсэлт илгээлээ.<br> Нууц үгээ доорхи линк дээр дарж солино уу:<br><br><a target="_blank" href="${link}">${link}</a><br><br>Өдрийг сайхан өнгөрүүлээрэй!`;

  const info = await sendEmail({
    email: user.email,
    subject: "Нууц үг өөрчлөх хүсэлт",
    message,
  });

  console.log("Message sent: %s", info.messageId);

  res.status(200).json({
    success: true,
    resetToken,
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.resetToken || !req.body.password) {
    throw new MyError("Та токен болон нууц үгээ дамжуулна уу", 400);
  }

  const encrypted = crypto
    .createHash("sha256")
    .update(req.body.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: encrypted,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new MyError("Токен хүчингүй байна!", 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = user.getJsonWebToken();

  res.status(200).json({
    success: true,
    token,
    user: user,
  });
});

export const invoiceTime = asyncHandler(async (req, res, next) => {
  const profile = await User.findById(req.params.id);
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
          invoice_code: "SANTA_MN_INVOICE",
          sender_invoice_no: "12345678",
          invoice_receiver_code: `${profile.username}`,
          invoice_description: `S69 access ${profile.username}`,
          amount: 20000,
          callback_url: `https://santa.mn/users/callbacks/${req.params.id}/${req.body.amount}`,
        },
      })
        .then(async (response) => {
          req.body.urls = response.data.urls;
          req.body.qrImage = response.data.qr_image;
          req.body.invoiceId = response.data.invoice_id;
          const wallet = await Wallet.create(req.body);
          profile.invoiceId = wallet._id;
          profile.save();
          res.status(200).json({
            success: true,
            data: wallet,
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
          const profile = await User.findById(req.params.numId);
          const count = response.data.count;
          if (count === 0) {
            res.status(402).json({
              success: false,
            });
          } else {
            // const price = parseInt(req.params.numId, 10);
            profile.isPayment = true;
            profile.save();
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
              data: profile,
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
  const profile = await User.findById(req.params.id);
  const price = parseInt(req.params.numId, 10);
  // if (price === 100) {
  profile.isPayment = true;
  profile.save();
  await User.updateOne(
    { _id: profile._id },
    { $inc: { notificationCount: 1 } }
  );
  if (profile.expoPushToken) {
    await sendNotification(profile.expoPushToken, `Үйлчилгээний эрх нээгдлээ`);
  }

  await Notification.create({
    title: `Үйлчилгээний эрх нээгдлээ`,
    users: profile._id,
  });
  // }
  res.status(200).json({
    success: true,
    data: profile,
  });
});
