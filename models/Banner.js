import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Гарчиг оруулна уу"],
      trim: true,
      maxlength: [250, "Гарчигийн урт дээд тал нь 250 тэмдэгт байх ёстой."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Тайлбарын урт дээд тал нь 500 тэмдэгт байх ёстой."],
    },
    feature: {
      type: mongoose.Schema.ObjectId,
      ref: "Feature",
    },
    isHomeScreen: {
      type: Boolean,
      default: false,
    },
    image: {
      type: mongoose.Schema.ObjectId,
      ref: "Image",
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
    },
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    updateUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Banner", BannerSchema);
