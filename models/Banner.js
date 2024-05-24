import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    url: {
      type: String,
    },
    blurHash: String,
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
