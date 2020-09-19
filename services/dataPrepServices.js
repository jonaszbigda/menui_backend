import { hashPass, newError, saveImage } from "./services.js";
import sanitizer from "string-sanitizer";
import mongoose from "mongoose";
import Dish from "../models/dish.js";
import User from "../models/users.js";
import Restaurant from "../models/restaurant.js";
import { fetchMultipleRestaurants } from "./databaseServices.js";

export async function createUser(request) {
  const password = await hashPass(request.body.password);
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    email: request.body.email,
    password: password,
    firstname: request.body.firstname,
    lastname: request.body.lastname,
    billing: {
      NIP: request.body.NIP,
      adress: request.body.adress,
      companyName: request.body.companyName,
    },
  });
  return user;
}

async function handleImageUpdate(request, previous) {
  if (!previous) {
    if (!request.imgURL) {
      return "empty";
    } else {
      const img = await saveImage(request.imgURL);
      return img;
    }
  } else {
    if (request.imgURL == previous.imgUrl) {
      return previous.imgUrl;
    } else {
      if (!request.imgURL) {
        return previous.imgUrl;
      } else {
        const img = await saveImage(request.imgURL);
        return img;
      }
    }
  }
}

export async function createRestaurant(request, oldRestaurant) {
  try {
    if (!oldRestaurant) {
      const img = await handleImageUpdate(request);
      const restaurant = new Restaurant({
        _id: new mongoose.Types.ObjectId(),
        name: sanitizer.sanitize.keepUnicode(request.name),
        city: sanitizer.sanitize.keepUnicode(request.city),
        adress: sanitizer.sanitize.keepUnicode(request.adress),
        location: {
          type: "Point",
          coordinates: request.coordinates,
        },
        placesId: request.placesId,
        imgUrl: img,
        workingHours: request.workingHours,
        description: sanitizer.sanitize.keepUnicode(request.description),
        tags: request.tags,
        links: {
          facebook: request.facebook,
          instagram: request.instagram,
          www: request.www,
        },
        phone: request.phone,
        hidden: request.hidden,
      });
      return restaurant;
    } else {
      const img = await handleImageUpdate(request, oldRestaurant);
      const restaurant = new Restaurant({
        name: sanitizer.sanitize.keepUnicode(request.name),
        city: sanitizer.sanitize.keepUnicode(request.city),
        dishes: oldRestaurant.dishes,
        adress: sanitizer.sanitize.keepUnicode(request.adress),
        location: {
          type: "Point",
          coordinates: request.coordinates,
        },
        placesId: request.placesId,
        imgUrl: img,
        workingHours: request.workingHours,
        description: sanitizer.sanitize.keepUnicode(request.description),
        tags: request.tags,
        links: request.links,
        phone: request.phone,
        hidden: request.hidden,
      });
      return restaurant;
    }
  } catch (error) {
    console.log(error);
    throw newError("Niewłaściwe dane", 206);
  }
}

export async function prepareSafeUser(user) {
  const restaurants = await fetchMultipleRestaurants(user.restaurants);
  const safeUser = {
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    id: user._id,
    restaurants: restaurants,
    NIP: user.billing.NIP,
    adress: user.billing.adress,
    companyName: user.billing.companyName,
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
        glicemicIndex: dish.glicemicIndex,
        kCal: dish.kCal,
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
        glicemicIndex: dish.glicemicIndex,
        kCal: dish.kCal,
        vegan: dish.vegan,
        vegetarian: dish.vegetarian,
      });
      return newDish;
    }
  } catch (e) {
    throw newError("Cannot create dish", 500);
  }
}
