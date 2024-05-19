import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Барааны гарчиг оруулна уу"],
      unique: true,
      trim: true,
      maxlength: [
        250,
        "Барааны гарчиг урт дээд тал нь 250 тэмдэгт байх ёстой.",
      ],
    },
    thumbnail: {
      url: String,
      blurHash: String,
    },
    images: [
      {
        url: String,
        blurHash: String,
      },
    ],
    options: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Option",
      },
    ],
    variants: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Variant",
      },
    ],
    description: {
      type: String,
      required: [true, "Барааны тайлбарыг оруулна уу"],
    },
    price: Number,
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
