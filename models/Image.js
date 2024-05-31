import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
    },
    blurHash: String,
    name: String,
    type: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Image", ImageSchema);
