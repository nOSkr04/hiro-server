import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [
        250,
        "Барааны гарчиг урт дээд тал нь 250 тэмдэгт байх ёстой.",
      ],
    },
    thumbnail: {
      type: mongoose.Schema.ObjectId,
      ref: "Image",
    },
    type: {
      type: String,
      enum: ["NEW", "ACTIVE", "DRAFT", "ARCHIVED"],
      default: "NEW",
    },
    images: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Image",
      },
    ],
    options: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Option",
      },
    ],
    description: {
      type: String,
      required: [true, "Барааны тайлбарыг оруулна уу"],
    },
    quantity: Number,
    price: Number,
    initPrice: Number,
    discount: Number,
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
    },
    seen: {
      type: Number,
      default: 0,
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

export default mongoose.model("Product", ProductSchema);
