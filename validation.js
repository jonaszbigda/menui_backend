const Restaurant = require("./models/restaurant");
const Dish = require("./models/dish");
const User = require("./models/users");

function validateRestaurant(id) {
  /*Restaurant.findById(id, (err, data) => {
    if (err) return err;
    else return data;
  });*/
  return id;
}

function validateUser(id) {
  return id;
}

exports.validateRestaurant = validateRestaurant;
exports.validateUser = validateUser;
