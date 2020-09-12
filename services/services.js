import Restaurant from "../models/restaurant.js";
import Dish from "../models/dish.js";
import User from "../models/users.js";
import mongoose from "mongoose";
import sanitizer from "string-sanitizer";
import { renameBlob } from "./azureServices.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as config from "../config/index.js";
const { jwtSecret } = config;

export function newError(message, status) {
  const error = {
    message: message,
    status: status,
  };
  return error;
}

export function handleError(error, responseObject) {
  if (!error.status) {
    console.log(error);
    responseObject.sendStatus(500);
  } else {
    responseObject.status(error.status).send(error.message);
  }
}

export async function validateRestaurant(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw newError("Invalid ID", 204);
  let valid = await Restaurant.exists({ _id: id });
  if (valid !== true) throw newError("Restaurant doesn't exist", 404);
  return true;
}

export function decodeAndSanitize(query) {
  if (!query) throw newError("Nothing to sanitize...", 204);
  return sanitizer.sanitize.keepUnicode(decodeURI(query));
}

export async function checkPassword(password, hash) {
  const result = await bcrypt.compare(password, hash);
  if (!result) throw newError("Wrong password :(", 401);
}

export function generateAuthToken(user) {
  const token = jwt.sign(
    {
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      id: user.id,
      restaurants: user.restaurants,
    },
    jwtSecret,
    { expiresIn: "1h" }
  );
  return token;
}

function generatePasswordResetToken(email) {
  const token = jwt.sign(
    {
      email: email,
    },
    jwtSecret,
    { expiresIn: "15m" }
  );
  return token;
}

export function generatePasswordResetLink(email) {
  const token = generatePasswordResetToken(email);
  const link = `https://www.menui.pl/forgot?token=${token}`;
  return link;
}

export async function checkEmailTaken(email) {
  if (!email) throw newError("No input email", 204);
  await User.exists({ email: email }).then((res) => {
    if (res) {
      throw newError("Email is taken", 409);
    }
  });
}

export function validateUserToken(token) {
  if (!token) throw newError("Invalid user token", 401);
  const verified = jwt.verify(token, jwtSecret, { ignoreExpiration: false });
  if (!verified) throw newError("Invalid user token", 401);
  return verified;
}

export async function validateDishId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw newError("Invalid ID", 400);
  }
  const dishDoesExist = Dish.exists({ _id: id });
  if (!dishDoesExist) throw newError("Dish doesn't exist", 404);
}

export async function verifyDishAccess(dishId, decodedToken) {
  const fetch = await User.findById(decodedToken.id, "restaurants");
  const restaurants = fetch.restaurants;
  const restaurantId = await Dish.findById(dishId, "restaurantId").catch(
    (error) => {
      throw newError("Couldn't fetch Dish", 404);
    }
  );
  const valid = restaurants.includes(restaurantId.restaurantId);
  if (!valid) throw newError("You don't have access to this Dish.", 401);
}

export function yearFromNowDate() {
  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
  var date = new Date();
  return date.addDays(365);
}

export function halfYearFromNowDate() {
  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
  var nowDate = new Date();
  var resultDate = nowDate.addDays(183);
  return toShortDate(resultDate);
}

export async function hashPass(pass) {
  if (pass.length < 6) {
    throw newError("Hasło za krótkie.", 500);
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);
    return hash;
  } catch (error) {
    throw newError("Internal error", 500);
  }
}

export function dueDateBasedOnSubscription(subscriptionActive) {
  if (subscriptionActive === true) {
    return halfYearFromNowDate();
  } else {
    return new Date();
  }
}

export function toShortDate(date) {
  if (!date) return false;
  const shortDate =
    date.getMonth() + "/" + date.getDay() + "/" + date.getFullYear();
  return shortDate;
}

export async function saveImage(url) {
  const newURL = await renameBlob(url);
  return newURL;
}
