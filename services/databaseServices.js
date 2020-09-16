import Restaurant from "../models/restaurant.js";
import Dish from "../models/dish.js";
import User from "../models/users.js";
import { newError } from "./services.js";

export async function changeUserPass(userId, newPass) {
  User.findByIdAndUpdate(userId, { $set: { password: newPass } }).catch((e) => {
    throw newError("Zmiana hasła nie powiodła się.", 500);
  });
}

export async function removeDish(dishId) {
  const deletedDoc = await Dish.findByIdAndDelete(dishId).catch((e) => {
    throw newError("Usunięcie dania nie powiodło się.", 500);
  });
  await Restaurant.findByIdAndUpdate(deletedDoc.restaurantId, {
    $pull: { dishes: dishId },
  }).catch((error) => {
    throw newError("Usunięcie dania z restauracji nie powiodło się.", 500);
  });
}

export async function removeRestaurant(restaurantId, userId) {
  const deletedDoc = await Restaurant.findByIdAndDelete(restaurantId).catch(
    (e) => {
      throw newError("Usunięcie nie powiodło się.", 500);
    }
  );
  await User.findByIdAndUpdate(userId, {
    $pull: { restaurants: restaurantId },
  }).catch((e) => {
    throw newError(
      "Usunięcie restauracji z użytkownika nie powiodło się.",
      500
    );
  });
}

export async function addDishToRestaurant(restaurantId, dishId) {
  await Restaurant.updateOne(
    { _id: restaurantId },
    { $push: { dishes: dishId } }
  ).catch((error) => {
    throw newError("Couldn't add dish to restaurant", 500);
  });
}

export async function addRestaurantToUser(user, restaurant) {
  await User.findByIdAndUpdate(user.id, {
    $push: { restaurants: restaurant._id },
  }).catch((e) => {
    throw newError("Couldn't add restaurant to user", 500);
  });
}

export async function fetchRestaurant(id) {
  let data;
  await Restaurant.findById(id, (err, result) => {
    data = result;
  }).catch((e) => {
    throw newError("Couldn't fetch restaurant", 500);
  });
  return data;
}

export async function fetchAllDishesForRestaurant(restaurant) {
  let dishes = [];
  for (const dish of restaurant.dishes) {
    let res = await fetchDish(dish._id);
    if (res !== null) dishes.push(res);
  }
  return dishes;
}

export async function fetchDish(id) {
  let data = await Dish.findById(id).catch((e) => {
    throw newError(`Couldn't fetch ${id}`, 404);
  });
  return data;
}

export async function fetchUser(email) {
  if (!email) throw newError("No input", 204);
  const user = await User.findOne({ email: email });
  if (!user) throw newError("No such user...", 404);
  return user;
}
