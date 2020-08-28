import Restaurant from "../models/restaurant.js";
import Dish from "../models/dish.js";
import User from "../models/users.js";
import mongoose from "mongoose";
import sanitizer from "string-sanitizer";
import { newError } from "./services.js";

export async function changeUserPass(userId, newPass) {
  User.findByIdAndUpdate(userId, { $set: { password: newPass } }).catch((e) => {
    throw newError("Cannot change password", 500);
  });
}

export async function removeDish(dishId) {
  const deletedDoc = await Dish.findByIdAndDelete(dishId).catch((e) => {
    throw newError("Unable to delete Dish", 500);
  });
  await Restaurant.findByIdAndUpdate(deletedDoc.restaurantId, {
    $pull: { dishes: dishId },
  }).catch((error) => {
    throw newError("Unable to remove Dish from restaurant", 500);
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
