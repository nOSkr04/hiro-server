import mongoose from "mongoose";

const HomeScreenSchema = new mongoose.Schema(
  {
    banners: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Banner",
      },
    ],
    categories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
      },
    ],
    products: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    newProducts: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
    },
    features: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Feature",
      },
    ],
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

export default mongoose.model("HomeScreen", HomeScreenSchema);
