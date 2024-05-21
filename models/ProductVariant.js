import mongoose from "mongoose";

const ProductVariantSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Сонголтын нэр оруулна уу"],
      unique: true,
      trim: true,
      maxlength: [250, "Сонголтын нэр урт дээд тал нь 250 тэмдэгт байх ёстой."],
    },
    type: {
      type: String,
      enum: ["DEFAULT","MANUAL"]
    },
    images: [
      {
        url: String,
        blurHash: String,
      },
    ],
    availableForSale: {
      type: Boolean,
      default: false
    },
    price: Number,
    quantiy: Number,
    firstQuantity: Number,
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

export default mongoose.model("ProductVariant", ProductVariantSchema);
