import Restaurant from "../models/restaurant.js";
import Dish from "../models/dish.js";
import User from "../models/users.js";
import mongoose from "mongoose";

export function validateRestaurant(id, callback) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    Restaurant.exists({ _id: id }, (err, res) => {
      if (err) {
        callback(false);
      } else {
        callback(res);
      }
    });
  } else callback(false);
}

export function validateUser(id, callback) {
  callback(true);
}

export function validateDishId(id, callback) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    Dish.exists({ _id: id }, (err, res) => {
      if (err) {
        callback(false);
      } else {
        callback(res);
      }
    });
  } else callback(false);
}
