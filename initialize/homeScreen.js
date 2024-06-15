import HomeScreen from "../models/HomeScreen.js";
export const initHomeScreen = async () => {
  let homeScreen = await HomeScreen.findOne({});
  if (homeScreen) {
    return {
      homeScreen,
    };
  }
  homeScreen = new HomeScreen({
    banners: [],
    categories: [],
    products: [],
    newProducts: [],
    category: null,
    features: [],
    createUser: null,
    updateUser: null,
    createdAt: new Date(),
    instagrams: [],
    blogs: []
  });

  homeScreen = await homeScreen.save();

  return {
    homeScreen,
  };
};
