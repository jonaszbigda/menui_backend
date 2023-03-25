const Restaurant = require("../models/restaurant.js");
const Dish = require("../models/dish.js");
const User = require("../models/users.js");
const Report = require("../models/reports.js");
const { deleteImage } = require("./oceanServices.js");
const { newError } = require("./services.js");

// REMOVE DISH

async function removeDish(dishId) {
  const deletedDoc = await Dish.findByIdAndDelete(dishId).catch((e) => {
    throw newError("Usunięcie dania nie powiodło się.", 500);
  });
  await deleteImage(deletedDoc.imgUrl);
  await Restaurant.findByIdAndUpdate(deletedDoc.restaurantId, {
    $pull: { dishes: dishId },
  }).catch((error) => {
    throw newError("Usunięcie dania z restauracji nie powiodło się.", 500);
  });
}

// REMOVE RESTAURANT

async function removeRestaurant(restaurantId, userId) {
  const deletedDoc = await Restaurant.findByIdAndDelete(restaurantId).catch(
    (e) => {
      throw newError("Usunięcie nie powiodło się.", 500);
    }
  );
  await deleteImage(deletedDoc.imgUrl);
  for (dishId of deletedDoc.dishes) {
    const deletedDish = await Dish.findByIdAndDelete(dishId).catch((e) =>
      console.log(e)
    );
    await deleteImage(deletedDish.imgUrl);
  }
  await User.findByIdAndUpdate(userId, {
    $pull: { restaurants: restaurantId },
  }).catch((e) => {
    throw newError(
      "Usunięcie restauracji z użytkownika nie powiodło się.",
      500
    );
  });
}

// ADD DISH TO RESTAURANT

async function addDishToRestaurant(restaurantId, dishId) {
  await Restaurant.updateOne(
    { _id: restaurantId },
    { $push: { dishes: dishId } }
  ).catch((error) => {
    throw newError("Nie udało się dodać dania do restauracji", 500);
  });
}

// ADD RESTAURANT

async function addRestaurantToUser(user, restaurant) {
  await User.findByIdAndUpdate(user.id, {
    $push: { restaurants: restaurant._id },
  }).catch((e) => {
    throw newError("Nie udało się dodać restauracji do użytkownika", 500);
  });
}

// CHECK IF CATEGORY EXISTS

async function checkIfCategoryExists(restaurant, category) {
  const categories = restaurant.categories;
  if (categories.includes(category)) {
    throw newError("Podana kategoria już istnieje", 200);
  }
}

// ADD OR REMOVE CATEGORY

async function changeCategory(restaurantId, categoryName, action) {
  if (action === "add") {
    const restaurant = await Restaurant.findById(restaurantId).catch((err) => {
      throw newError("Nie udało się pobrać restauracji.", 404);
    });
    await checkIfCategoryExists(restaurant, categoryName);
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $push: { categories: categoryName },
    }).catch((e) => {
      throw newError("Nie udało się dodać kategorii.", 500);
    });
  } else if (action === "delete") {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $pull: { categories: categoryName },
    }).catch((e) => {
      throw newError("Nie udało się usunąć kategorii.", 500);
    });
  } else {
    throw newError("Nieznany błąd.", 500);
  }
}

// SET DISH VISIBILITY

async function setDishVisibility(dishId, visible) {
  await Dish.findByIdAndUpdate(dishId, { $set: { hidden: !visible } }).catch(
    (e) => {
      throw newError("Nie udało się zmienić dania.", 500);
    }
  );
}

// FETCH RESTAURANT

async function fetchRestaurant(id) {
  const data = await Restaurant.findById(id).catch((e) => {
    throw newError("Nie udało się pobrać restauracji.", 500);
  });
  return data;
}

// FETCH MULTIPLE RESTAURANTS

async function fetchMultipleRestaurants(idArray) {
  let data = await Restaurant.find().where("_id").in(idArray).exec();
  return data;
}

// FETCH DISHES FOR RESTAURANT

async function fetchAllDishesForRestaurant(restaurant) {
  const idList = restaurant.dishes;
  const dishes = await Dish.find({ _id: { $in: idList } });
  return dishes;
}

// FETCH SINGLE DISH

async function fetchDish(id) {
  let data = await Dish.findById(id).catch((e) => {
    throw newError(`Nie udało się pobrać ${id}`, 404);
  });
  return data;
}

// FETCH USER BY EMAIL

async function fetchUser(email) {
  if (!email) throw newError("Brak danych", 204);
  const user = await User.findOne({ email: email });
  if (!user) throw newError("Użytkownik nie istnieje", 404);
  return user;
}

// SET RESTAURANT VISIBLE

async function setRestaurantVisibility(restaurantId, visible) {
  await Restaurant.findByIdAndUpdate(restaurantId, {
    $set: { hidden: !visible },
  }).catch((e) => {
    throw newError("Nie udało się zmienić dania.", 500);
  });
}

// FETCH ALL DATA

async function fetchAllAdminData() {
  const restaurants = await Restaurant.find(
    {},
    "_id name city adress subscriptionActive subscriptionDue phone dishes"
  );
  const reports = await Report.find({});
  const users = await User.find(
    {},
    "_id email firstname lastname login billing isRestaurant restaurants trialUsed photos"
  );
  const result = {
    restaurants: restaurants,
    reports: reports,
    users: users,
  };
  return result;
}

exports.removeDish = removeDish;
exports.removeRestaurant = removeRestaurant;
exports.addDishToRestaurant = addDishToRestaurant;
exports.addRestaurantToUser = addRestaurantToUser;
exports.changeCategory = changeCategory;
exports.setDishVisibility = setDishVisibility;
exports.fetchRestaurant = fetchRestaurant;
exports.fetchMultipleRestaurants = fetchMultipleRestaurants;
exports.fetchAllDishesForRestaurant = fetchAllDishesForRestaurant;
exports.fetchDish = fetchDish;
exports.fetchUser = fetchUser;
exports.setRestaurantVisibility = setRestaurantVisibility;
exports.fetchAllAdminData = fetchAllAdminData;
