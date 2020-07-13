const Restaurant = require("./models/restaurant");
const Dish = require("./models/dish");
const User = require("./models/users");
const mongoose = require("mongoose");

function validateRestaurant(id, callback) {
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

function validateUser(id, callback) {
  callback(true);
}

function validateDishId(id, callback) {
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

exports.validateRestaurant = validateRestaurant;
exports.validateUser = validateUser;
exports.validateDishId = validateDishId;
