import mongoose from "mongoose";

const InstagramSchema = new mongoose.Schema(
  {
    url: {
      type: String,
    },
    name: String,
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    seen: {
      type: Number,
      default: 0,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Instagram", InstagramSchema);
