import Restaurant from "../models/restaurant.js";
import express from "express";
import Dish from "../models/dish.js";
import User from "../models/users.js";
import mongoose from "mongoose";
import sanitizer from "string-sanitizer";
import jwt from "jsonwebtoken";
import fs from "fs";
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

export function fetchUserHash(email, callback) {
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
    { email: user.email, subcsriptionActive: user.subscriptionActive },
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

export function validateUserToken(token, callback) {
  jwt.verify(token, jwtSecret, { ignoreExpiration: false }, (err, decoded) => {
    if (err) {
      callback(false);
    } else {
      if (decoded === undefined) {
        callback(false);
      } else {
        callback(decoded);
      }
    }
  });
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
      vegan: dish.vegan,
      vegetarian: dish.vegetarian,
    });
    return newDish;
  }
}

function renameImage(imagePath) {
  var newPath = imagePath.replace("_TEMP", "");
  fs.rename(imagePath, newPath, (err) => {
    if (err) console.log(err);
  });
  return newPath;
}

function chooseImg(cookie, originalPath) {
  var cookiePath = decodeURI(cookie);
  if (cookiePath != originalPath) {
    return saveImage(cookie);
  } else {
    return originalPath;
  }
}

export function saveImage(cookie) {
  if (cookie == undefined) {
    return undefined;
  } else {
    var decodedCookie = decodeURI(cookie);
    var newPath = renameImage(decodedCookie);
    return newPath;
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
    return yearFromNowDate();
  } else {
    return new Date();
  }
}
