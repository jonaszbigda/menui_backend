import { hashPass, newError, saveImage } from "./services.js";
import sanitizer from "string-sanitizer";
import mongoose from "mongoose";
import Dish from "../models/dish.js";
import User from "../models/users.js";
import Restaurant from "../models/restaurant.js";

export function composeNewContact(request) {
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

export function createRestaurant(request) {
  try {
    const restaurant = new Restaurant({
      _id: new mongoose.Types.ObjectId(),
      name: sanitizer.sanitize.keepUnicode(request.name),
      city: sanitizer.sanitize.keepUnicode(request.city),
      adress: sanitizer.sanitize.keepUnicode(request.adress),
      location: request.location,
      imgUrl: saveImage(request.imgURL),
      workingHours: request.workingHours,
      description: sanitizer.sanitize.keepUnicode(request.description),
      tags: request.tags,
      links: request.links,
      phone: request.phone,
      hidden: request.hidden,
    });
    return restaurant;
  } catch (error) {
    throw newError("Invalid input data", 206);
  }
}

export function prepareSafeUser(user) {
  const safeUser = {
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    id: user._id,
    restaurants: user.restaurants,
  };
  return safeUser;
}

export async function createDish(dish, restaurantId, generateId) {
  try {
    if (generateId) {
      const img = await saveImage(dish.imgUrl);
      const newDish = new Dish({
        _id: new mongoose.Types.ObjectId(),
        restaurantId: restaurantId,
        name: sanitizer.sanitize.keepUnicode(dish.name),
        category: dish.category,
        price: dish.price,
        notes: sanitizer.sanitize.keepUnicode(dish.notes),
        imgUrl: img,
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
        restaurantId: restaurantId,
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
  } catch (e) {
    throw newError("Cannot create dish", 500);
  }
}