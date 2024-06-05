import mongoose from "mongoose";
import { type } from "os";

const BlogSchema = new mongoose.Schema(
  {
    url: {
      type: String,
    },
    title: {
      type: String,
      required: [true, "Блогийн гарчиг оруулна уу"],
      maxlength: [
        250,
        "Блогийн гарчигийн урт дээд тал нь 250 тэмдэгт байх ёстой.",
      ],
    },
    description: {
      type: String,
      required: [true, "Блогийн тайлбар оруулна уу"],
      maxlength: [
        250,
        "Блогийн гарчигийн урт дээд тал нь 250 тэмдэгт байх ёстой.",
      ],
    },
    seen: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Blog", BlogSchema);
