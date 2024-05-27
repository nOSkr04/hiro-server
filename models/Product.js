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
    type: {
      type: String,
      enum: ["NEW", "ACTIVE", "DRAFT", "ARCHIVED"],
      default: "NEW",
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
    description: {
      type: String,
      required: [true, "Барааны тайлбарыг оруулна уу"],
    },
    price: Number,
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
