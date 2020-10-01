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
  if (!mongoose.Types.ObjectId.isValid(id))
    throw newError("Nieprawidłowy ID", 204);
  let valid = await Restaurant.exists({ _id: id });
  if (valid !== true) throw newError("Restauracja nie istnieje w bazie.", 404);
  return true;
}

export function decodeAndSanitize(query) {
  if (!query) throw newError("Brak danych.", 204);
  return sanitizer.sanitize.keepUnicode(decodeURI(query));
}

export async function checkPassword(password, hash) {
  const result = await bcrypt.compare(password, hash);
  if (!result) throw newError("Hasło nieprawidłowe", 401);
}

export function generateAuthToken(user) {
  const token = jwt.sign(
    {
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      billing: user.billing,
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
    { expiresIn: "30m" }
  );
  return token;
}

export function generatePasswordResetLink(email) {
  const token = generatePasswordResetToken(email);
  const link = `localhost:3000/resetpassword?token=${token}`;
  return link;
}

export async function checkEmailTaken(email) {
  if (!email) throw newError("Brak adresu email", 204);
  await User.exists({ email: email }).then((res) => {
    if (res) {
      throw newError("Adres email zajęty", 409);
    }
  });
}

export function validateUserToken(token) {
  if (!token) throw newError("Brak dostępu", 401);
  try {
    const verified = jwt.verify(token, jwtSecret, { ignoreExpiration: false });
    if (!verified) throw newError("Brak dostępu", 401);
    return verified;
  } catch (error) {
    throw newError("Brak dostępu", 401);
  }
}

export async function validateDishId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw newError("Niewłaściwy ID", 400);
  }
  const dishDoesExist = Dish.exists({ _id: id });
  if (!dishDoesExist) throw newError("Te danie nie istnieje w bazie.", 404);
}

export async function verifyDishAccess(dishId, decodedToken) {
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

export async function verifyRestaurantAccess(restaurantId, decodedToken) {
  const fetch = await User.findById(decodedToken.id, "restaurants").catch(
    (error) => {
      throw newError("Nie znaleziono użytkownika.", 500);
    }
  );
  const restaurants = fetch.restaurants;
  const valid = restaurants.includes(restaurantId);
  if (!valid) throw newError("Nie masz dostępu do tej restauracji.", 401);
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

export async function hashPass(pass) {
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

export async function saveImage(url) {
  const newURL = await renameBlob(url);
  return newURL;
}
