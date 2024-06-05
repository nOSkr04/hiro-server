import mongoose from "mongoose";

const FeatureSchema = new mongoose.Schema(
  {
    isHomeScreen: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: [true, "Тодорхойлолтын нэр оруулна уу"],
      trim: true,
      maxlength: [
        250,
        "Тодорхойлолтын нэр урт дээд тал нь 250 тэмдэгт байх ёстой.",
      ],
    },
    icon: {
      type: mongoose.Schema.ObjectId,
      ref: "Image",
    },
    products: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    images: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Image",
      },
    ],
    description: {
      type: String,
      required: [true, "Тодорхойлолтын тайлбар оруулна уу"],
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

export default mongoose.model("Feature", FeatureSchema);
