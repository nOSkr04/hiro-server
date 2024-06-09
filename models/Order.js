import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    products: [{
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    }],
    cards: [{
        type: mongoose.Schema.ObjectId,
        ref: "Card",
    }],
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    payment: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    address: {
      type: String,
    //   required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    //   required: true,
    },
    email: {
      type: String,
    //   required: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Order", OrderSchema);
