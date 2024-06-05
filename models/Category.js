import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Категорийн нэр оруулна уу"],
      unique: true,
      trim: true,
      maxlength: [
        250,
        "Категорийн нэр урт дээд тал нь 250 тэмдэгт байх ёстой.",
      ],
    },
    productCount: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: "default.jpg",
    },
    color: {
      type: String,
      default: "#000000",
    },
    parentCategory: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
    },
    childCategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
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

export default mongoose.model("Category", CategorySchema);
