import User from "../models/User.js";

export const initUser = async () => {
  let user = await User.findOne({});
  if (user) {
    return {
      user,
    };
  }
  user = new User({
    avatar: null,
    phone: "80019088",
    password: "0401",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  user = await user.save();

  return {
    user,
  };
};
