const { hashPass, newError, saveImage } = require("./services.js");
const mongoose = require("mongoose");
const Dish = require("../models/dish.js");
const User = require("../models/users.js");
const Restaurant = require("../models/restaurant.js");
const { fetchMultipleRestaurants } = require("./databaseServices.js");
const { deleteImage } = require("./oceanServices.js");

async function createUser(request) {
  const password = await hashPass(request.body.password);
  let user;
  if(request.body.isRestaurant === true){
    user = new User({
      _id: new mongoose.Types.ObjectId(),
      email: request.body.email,
      password: password,
      firstname: request.body.firstname,
      lastname: request.body.lastname,
      isRestaurant: true,
      billing: {
        NIP: request.body.NIP,
        adress: request.body.adress,
        companyName: request.body.companyName,
      },
    });
  } else {
    user = new User({
      _id: new mongoose.Types.ObjectId(),
      email: request.body.email,
      login: request.body.login,
      password: password,
      isRestaurant: false,
    });
  }
  return user;
}

async function handleImageUpdate(request, previous) {
  if (!previous) {
    if (!request.imgUrl) {
      return "empty";
    } else {
      const img = await saveImage(request.imgUrl);
      return img;
    }
  } else {
    if (request.imgUrl == previous.imgUrl) {
      return previous.imgUrl;
    } else {
      if (!request.imgUrl) {
        return previous.imgUrl;
      } else {
        const img = await saveImage(request.imgUrl);
        await deleteImage(previous.imgUrl);
        return img;
      }
    }
  }
}

async function createRestaurant(request, oldRestaurant) {
  try {
    if (!oldRestaurant) {
      const img = await handleImageUpdate(request);
      const restaurant = new Restaurant({
        _id: new mongoose.Types.ObjectId(),
        name: request.name,
        city: request.city,
        adress: request.adress,
        location: {
          type: "Point",
          coordinates: request.coordinates,
        },
        placesId: request.placesId,
        type: request.type,
        imgUrl: img,
        workingHours: request.workingHours,
        lunchHours: request.lunchHours,
        description: request.description,
        tags: request.tags,
        links: request.links,
        phone: request.phone,
        hidden: request.hidden,
      });
      return restaurant;
    } else {
      const img = await handleImageUpdate(request, oldRestaurant);
      const restaurant = new Restaurant({
        _id: oldRestaurant._id,
        name: request.name,
        city: request.city,
        dishes: oldRestaurant.dishes,
        adress: request.adress,
        location: {
          type: "Point",
          coordinates: request.coordinates,
        },
        placesId: request.placesId,
        type: request.type,
        imgUrl: img,
        workingHours: request.workingHours,
        lunchHours: request.lunchHours,
        lunchMenu: oldRestaurant.lunchMenu,
        categories: oldRestaurant.categories,
        description: request.description,
        tags: request.tags,
        links: request.links,
        phone: request.phone,
        hidden: request.hidden,
        subscriptionActive: oldRestaurant.subscriptionActive,
        subscriptionDue: oldRestaurant.subscriptionDue,
        subscriptionStarted: oldRestaurant.subscriptionStarted,
      });
      return restaurant;
    }
  } catch (error) {
    console.log(error);
    throw newError("Niewłaściwe dane", 206);
  }
}

async function prepareSafeUser(user) {
  const restaurants = await fetchMultipleRestaurants(user.restaurants);
  const safeUser = {
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    login: user.login,
    isRestaurant: user.isRestaurant,
    id: user._id,
    restaurants: restaurants,
    NIP: user.billing.NIP,
    adress: user.billing.adress,
    companyName: user.billing.companyName,
  };
  return safeUser;
}

async function createDish(dish, restaurantId, oldDish) {
  try {
    if (!oldDish) {
      const img = await handleImageUpdate(dish);
      const newDish = new Dish({
        _id: new mongoose.Types.ObjectId(),
        restaurantId: restaurantId,
        name: dish.name,
        category: dish.category,
        prices: dish.prices,
        notes: dish.notes,
        imgUrl: img,
        weight: dish.weight,
        allergens: dish.allergens,
        ingredients: dish.ingredients,
        glicemicIndex: dish.glicemicIndex,
        kCal: dish.kCal,
        vegan: dish.vegan,
        vegetarian: dish.vegetarian,
      });
      return newDish;
    } else {
      const img = await handleImageUpdate(dish, oldDish);
      const newDish = new Dish({
        restaurantId: oldDish.restaurantId,
        name: dish.name,
        category: dish.category,
        prices: dish.prices,
        notes: dish.notes,
        imgUrl: img,
        weight: dish.weight,
        allergens: dish.allergens,
        ingredients: dish.ingredients,
        glicemicIndex: dish.glicemicIndex,
        kCal: dish.kCal,
        vegan: dish.vegan,
        vegetarian: dish.vegetarian,
      });
      return newDish;
    }
  } catch (e) {
    console.log(e);
    throw newError("Cannot create dish because: " + e, 500);
  }
}

function appendDishToLunchSet(lunchMenu, setName, dishId, quantity) {
  console.log("append called")
  const result = lunchMenu.map((lunchSet) => {
    if (lunchSet.lunchSetName === setName) {
      let updatedSet = lunchSet;
      let dishToAdd = {
        dishId: dishId,
        quantity: quantity
      }
      updatedSet.lunchSetDishes.push(dishToAdd);
      return updatedSet;
    } else {
      return lunchSet;
    }
  });
  return result;
}

function removeDishFromLunchSet(lunchMenu, setName, dishId) {
  const result = lunchMenu.map((lunchSet) => {
    if (lunchSet.lunchSetName === setName) {
      let updatedSet = lunchSet;
      const index = updatedSet.lunchSetDishes.findIndex(dish => dish.dishId === dishId);
      if (index > -1) {
        updatedSet.lunchSetDishes.splice(index, 1);
      }
      return updatedSet;
    } else {
      return lunchSet;
    }
  });
  return result;
}

exports.createUser = createUser;
exports.createRestaurant = createRestaurant;
exports.prepareSafeUser = prepareSafeUser;
exports.createDish = createDish;
exports.appendDishToLunchSet = appendDishToLunchSet;
exports.removeDishFromLunchSet = removeDishFromLunchSet;
