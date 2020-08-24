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
  if (valid !== true) throw newError("Restaurant doesn't exist", 404);
  return true;
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

export function decodeAndSanitize(query) {
  if (!query) throw newError("Nothing to sanitize...", 204);
  return sanitizer.sanitize.keepUnicode(decodeURI(query));
}

export async function checkPassword(password, hash) {
  const result = await bcrypt.compare(password, hash);
  if (!result) throw newError("Wrong password :(", 401);
}

export function prepareSafeUser(user) {
  const safeUser = {
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    id: user._id,
  };
  return safeUser;
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
}

export function validateDishId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw newError("Invalid ID", 400);
  }
  const dishDoesExist = Dish.exists({ _id: id });
  if (!dishDoesExist) throw newError("Dish doesn't exist", 404);
}

export async function addDishToRestaurant(restaurantId, dishId) {
  await Restaurant.updateOne(
    { _id: restaurantId },
    { $push: { dishes: dishId } }
  ).catch((error) => {
    throw newError("Couldn't add dish to restaurant", 500);
  });
}

export function createDish(dish, generateId) {
  // TEST THIS ONE!!!!!
  if (generateId) {
    const newDish = new Dish({
      _id: new mongoose.Types.ObjectId(),
      name: sanitizer.sanitize.keepUnicode(dish.name),
      category: dish.category,
      price: dish.price,
      notes: sanitizer.sanitize.keepUnicode(dish.notes),
      imgUrl: dish.imgUrl,
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
      imgUrl: dish.imgUrl,
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

export function createRestaurant(request) {
  try {
    const restaurant = new Restaurant({
      _id: new mongoose.Types.ObjectId(),
      name: sanitizer.sanitize.keepUnicode(request.body.name),
      city: sanitizer.sanitize.keepUnicode(request.body.city),
      imgUrl: services.saveImage(request.body.imgURL),
      workingHours: request.body.workingHours,
      description: sanitizer.sanitize.keepUnicode(request.body.description),
      tags: request.body.tags,
      links: request.body.links,
      phone: request.body.phone,
      hidden: request.body.hidden,
    });
    return restaurant;
  } catch (error) {
    throw newError("Invalid input data", 206);
  }
}

export async function createUser(request) {
  const password = await hashPass(request.body.password);
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    email: request.body.email,
    password: password,
    firstname: request.body.firstname,
    lastname: request.body.lastname,
  });
  return user;
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
