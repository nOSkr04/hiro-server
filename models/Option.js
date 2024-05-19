import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Сонголтын нэр оруулна уу"],
      unique: true,
      trim: true,
      maxlength: [250, "Сонголтын нэр урт дээд тал нь 250 тэмдэгт байх ёстой."],
    },

    values: [String],
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

export default mongoose.model("Option", OptionSchema);
