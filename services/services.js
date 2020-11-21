const Restaurant = require("../models/restaurant.js");
const Dish = require("../models/dish.js");
const User = require("../models/users.js");
const mongoose = require("mongoose");
const sanitizer = require("string-sanitizer");
const { renameBlob } = require("./oceanServices.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { jwtSecret } = require("../config/index.js");

function newError(message, status) {
  const error = {
    message: message,
    status: status,
  };
  return error;
}

function handleError(error, responseObject) {
  if (!error.status) {
    console.log(error);
    responseObject.sendStatus(500);
  } else {
    responseObject.status(error.status).send(error.message);
  }
}

async function validateRestaurant(id) {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw newError("Nieprawidłowy ID", 204);
  let valid = await Restaurant.exists({ _id: id });
  if (valid !== true) throw newError("Restauracja nie istnieje w bazie.", 404);
  return true;
}

function decodeAndSanitize(query) {
  if (!query) throw newError("Brak danych.", 204);
  return sanitizer.sanitize.keepUnicode(decodeURI(query));
}

async function checkPassword(password, hash) {
  const result = await bcrypt.compare(password, hash);
  if (!result) throw newError("Hasło nieprawidłowe", 401);
}

function generateAuthToken(user) {
  const token = jwt.sign(
    {
      email: user.email,
      id: user.id,
    },
    jwtSecret,
    { expiresIn: "15m" }
  );
  return token;
}

function generateRefreshToken(user) {
  const token = jwt.sign({
      email: user.email,
      id: user.id,
  }, jwtSecret, {
    expiresIn: "1h"
  });
  return token;
}

function generatePasswordResetToken(email) {
  const token = jwt.sign(
    {
      email: email,
    },
    jwtSecret,
    { expiresIn: "30m" }
  );
  return token;
}

// SET FRONTEND URL HERE

function generatePasswordResetLink(email) {
  const token = generatePasswordResetToken(email);
  const link = `https://www.menui.pl/resetpassword?token=${token}`;
  return link;
}

async function checkEmailTaken(email) {
  if (!email) throw newError("Brak adresu email", 204);
  await User.exists({ email: email }).then((res) => {
    if (res) {
      throw newError("Adres email zajęty", 409);
    }
  });
}

function validateUserToken(token) {
  if (!token) throw newError("Brak dostępu", 401);
  try {
    const verified = jwt.verify(token, jwtSecret, { ignoreExpiration: false });
    if (!verified) throw newError("Brak dostępu", 401);
    return verified;
  } catch (error) {
    throw newError("Brak dostępu", 401);
  }
}

function validateRefreshToken(token) {
  if (!token) throw newError("Brak dostępu", 401);
  try {
    const verified = jwt.verify(token, jwtSecret, { ignoreExpiration: false });
    if (!verified) throw newError("Brak dostępu", 401);
    return verified;
  } catch (error) {
    throw newError("Brak dostępu", 401);
  }
}

async function validateDishId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw newError("Niewłaściwy ID", 400);
  }
  const dishDoesExist = Dish.exists({ _id: id });
  if (!dishDoesExist) throw newError("Te danie nie istnieje w bazie.", 404);
}

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

function yearFromNowDate() {
  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
  var date = new Date();
  return date.addDays(365);
}

async function hashPass(pass) {
  if (pass.length < 6) {
    throw newError("Hasło za krótkie.", 500);
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);
    return hash;
  } catch (error) {
    throw newError("Błąd", 500);
  }
}

async function saveImage(url) {
  const newURL = await renameBlob(url);
  return newURL;
}

exports.newError = newError;
exports.handleError = handleError;
exports.validateRestaurant = validateRestaurant;
exports.decodeAndSanitize = decodeAndSanitize;
exports.checkPassword = checkPassword;
exports.generateAuthToken = generateAuthToken;
exports.generatePasswordResetLink = generatePasswordResetLink;
exports.checkEmailTaken = checkEmailTaken;
exports.validateUserToken = validateUserToken;
exports.validateDishId = validateDishId;
exports.verifyDishAccess = verifyDishAccess;
exports.verifyRestaurantAccess = verifyRestaurantAccess;
exports.yearFromNowDate = yearFromNowDate;
exports.hashPass = hashPass;
exports.saveImage = saveImage;
exports.generateRefreshToken = generateRefreshToken;
exports.validateRefreshToken = validateRefreshToken;
