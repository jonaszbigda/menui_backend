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
  if (!error.message) {
    responseObject.sendStatus(500);
  } else {
    responseObject.status(error.status).send(error.message);
  }
}

export async function validateRestaurant(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw newError("Invalid ID", 204);
  let valid = await Restaurant.exists({ _id: id });
  if (valid !== true) throw "Restaurant doesn't exist";
  return true;
}

export async function fetchRestaurant(id) {
  let data;
  await Restaurant.findById(id, (err, result) => {
    data = result;
  }).catch((e) => {
    throw "Couldn't fetch restaurant";
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
    throw `Couldn't fetch ${id}`;
  });
  return data;
}

export async function fetchUser(email) {
  if (!email) throw newError("No input", 404);
  User.findOne({ email: email });
}

export function decodeAndSanitize(query) {
  if (!query) throw "Nothing to sanitize...";
  return sanitizer.sanitize.keepUnicode(decodeURI(query));
}

export async function checkPassword(password, hash) {
  bcrypt.compare(password, hash);
}

export function generateAuthToken(user) {
  const token = jwt.sign(
    {
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      id: user._id,
      restaurants: user.restaurants,
    },
    jwtSecret,
    { expiresIn: "1h" }
  );
  return token;
}

export async function checkEmailTaken(email) {
  if (!email) throw newError("No input email", 204);
  await User.exists({ email: email })
    .then((res) => {
      if (res) {
        throw newError("Email is taken", 409);
      }
    })
    .catch((e) => {
      throw e;
    });
}

export function validateUserToken(token) {
  let verified;
  try {
    verified = jwt.verify(token, jwtSecret, { ignoreExpiration: false });
  } catch (error) {
    verified = false;
  }
  return verified; // should be return verified for production
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

export function createDish(dish, cookie, generateId) {
  if (generateId) {
    const newDish = new Dish({
      _id: new mongoose.Types.ObjectId(),
      name: sanitizer.sanitize.keepUnicode(dish.name),
      category: dish.category,
      price: dish.price,
      notes: sanitizer.sanitize.keepUnicode(dish.notes),
      imgUrl: saveImage(cookie),
      weight: dish.weight,
      allergens: {
        gluten: dish.allergens.gluten,
        lactose: dish.allergens.lactose,
        soy: dish.allergens.soy,
        eggs: dish.allergens.eggs,
        seaFood: dish.allergens.seaFood,
        peanuts: dish.allergens.peanuts,
        sesame: dish.allergens.sesame,
      },
      ingredients: dish.ingredients,
      vegan: dish.vegan,
      vegetarian: dish.vegetarian,
    });
    return newDish;
  } else {
    const newDish = new Dish({
      name: sanitizer.sanitize.keepUnicode(dish.name),
      category: dish.category,
      price: dish.price,
      notes: sanitizer.sanitize.keepUnicode(dish.notes),
      imgUrl: chooseImg(cookie),
      weight: dish.weight,
      allergens: {
        gluten: dish.allergens.gluten,
        lactose: dish.allergens.lactose,
        soy: dish.allergens.soy,
        eggs: dish.allergens.eggs,
        seaFood: dish.allergens.seaFood,
        peanuts: dish.allergens.peanuts,
        sesame: dish.allergens.sesame,
      },
      ingredients: dish.ingredients,
      vegan: dish.vegan,
      vegetarian: dish.vegetarian,
    });
    return newDish;
  }
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

export function composeNewContact(request) {
  const dateNow = new Date();
  const contact = {
    lead_score: "100",
    tags: ["newUser"],
    properties: [
      {
        type: "SYSTEM",
        name: "first_name",
        value: request.firstname,
      },
      {
        type: "SYSTEM",
        name: "last_name",
        value: request.lastname,
      },
      {
        type: "SYSTEM",
        name: "email",
        subtype: "work",
        value: request.email,
      },
      {
        type: "CUSTOM",
        name: "UserID",
        value: request._id,
      },
    ],
  };
  return contact;
}

export function toShortDate(date) {
  if (!date) return false;
  const shortDate =
    date.getMonth() + "/" + date.getDay() + "/" + date.getFullYear();
  return shortDate;
}

export function saveImage(url) {
  const newURL = renameBlob(url);
  return newURL;
}
