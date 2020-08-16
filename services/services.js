import Restaurant from "../models/restaurant.js";
import Dish from "../models/dish.js";
import User from "../models/users.js";
import mongoose from "mongoose";
import sanitizer from "string-sanitizer";
import renameBlob from "./renameBlob.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as config from "../config/index.js";
const { jwtSecret } = config;

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

export function fetchUser(email, callback) {
  User.findOne({ email: email }, (err, res) => {
    if (err || res === null) {
      callback(false);
    } else {
      callback(res);
    }
  });
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

export function checkEmailTaken(email, callback) {
  User.exists({ email: email }, (err, res) => {
    if (err) {
      callback(false);
    } else {
      callback(res);
    }
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

export function hashPass(pass, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) callback(false);
    bcrypt.hash(pass, salt, function (err, hash) {
      if (err) {
        callback(false);
      } else {
        callback(hash);
      }
    });
  });
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

function toShortDate(date) {
  const shortDate =
    date.getMonth() + "/" + date.getDay() + "/" + date.getFullYear();

  return shortDate;
}

export function saveImage(url) {
  const newURL = renameBlob(url);

  return newURL;
}
