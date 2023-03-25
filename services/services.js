const Restaurant = require("../models/restaurant.js");
const Dish = require("../models/dish.js");
const User = require("../models/users.js");
const mongoose = require("mongoose");
const sanitizer = require("string-sanitizer");
const { renameBlob } = require("./oceanServices.js");

// AUTH

function authenticate() {
  auth({
    audience: "https://menui.pl/api",
    issuerBaseURL: "https://bankaisoftware.eu.auth0.com/",
    tokenSigningAlg: "RS256",
  });
}

// NEW ERROR

function newError(message, status) {
  const error = {
    message: message,
    status: status,
  };
  return error;
}

// HANDLE ERROR

function handleError(error, responseObject) {
  if (!error.status) {
    console.log(error);
    responseObject.sendStatus(500);
  } else {
    responseObject.status(error.status).send(error.message);
  }
}

// VALIDATE RESTAURANT ID

async function validateRestaurant(id) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw newError("Nieprawidłowy ID", 204);
  let valid = await Restaurant.exists({ _id: id });
  if (valid !== true) throw newError("Restauracja nie istnieje w bazie.", 404);
  return true;
}

// DECODE AND SANITIZE URL

function decodeAndSanitize(query) {
  if (!query) throw newError("Brak danych.", 204);
  return sanitizer.sanitize.keepUnicode(decodeURI(query));
}

// VALIDATE DISH ID

async function validateDishId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw newError("Niewłaściwy ID", 400);
  }
  const dishDoesExist = Dish.exists({ _id: id });
  if (!dishDoesExist) throw newError("Te danie nie istnieje w bazie.", 404);
}

// VERIFY DISH ACCESS

async function verifyDishAccess(dishId, decodedToken) {
  const fetch = await User.findById(decodedToken.id, "restaurants").catch(
    (error) => {
      throw newError("Nie znaleziono użytkownika.", 500);
    }
  );
  const restaurants = fetch.restaurants;
  const restaurantId = await Dish.findById(dishId).catch((error) => {
    throw newError("Nie znaleziono dania.", 404);
  });
  const valid = restaurants.includes(restaurantId.restaurantId);
  if (!valid) throw newError("Nie masz dostępu do tego dania.", 401);
}

// VERIFY RESTAURANT ACCESS

async function verifyRestaurantAccess(restaurantId, decodedToken) {
  const fetch = await User.findById(decodedToken.id, "restaurants").catch(
    (error) => {
      throw newError("Nie znaleziono użytkownika.", 500);
    }
  );
  const restaurants = fetch.restaurants;
  const valid = restaurants.includes(restaurantId);
  if (!valid) throw newError("Nie masz dostępu do tej restauracji.", 401);
}

// YEAR FROM NOW DATE

function yearFromNowDate() {
  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
  var date = new Date();
  return date.addDays(365);
}

async function saveImage(url) {
  const newURL = await renameBlob(url);
  return newURL;
}

exports.authenticate = authenticate;
exports.newError = newError;
exports.handleError = handleError;
exports.validateRestaurant = validateRestaurant;
exports.decodeAndSanitize = decodeAndSanitize;
exports.validateDishId = validateDishId;
exports.verifyDishAccess = verifyDishAccess;
exports.verifyRestaurantAccess = verifyRestaurantAccess;
exports.yearFromNowDate = yearFromNowDate;
exports.saveImage = saveImage;
