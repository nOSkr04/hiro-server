import mongoose from "mongoose";

const CardSchema = new mongoose.Schema(
  {
    productVariant: {
      type: mongoose.Schema.ObjectId,
      ref: "ProductVariant",
    },
    quantity: Number,
    price: Number,
    totalPrice: Number,
    user: {
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

export default mongoose.model("Card", CardSchema);
