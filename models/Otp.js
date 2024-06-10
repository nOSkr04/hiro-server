import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    otp: {
      type: String,
      required: [true, "OTP код оруулна уу"],
    },
    // phone: {
    //   type: String,
    //   required: [true, "Утасны дугаар оруулна уу"],
    // },
    // expireAt: {
    //   type: Date,
    //   default: Date.now,
    //   index: { expires: 600 },
    // },
    users: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Otp", OtpSchema);
