const Restaurant = require("../models/restaurant.js");
const Dish = require("../models/dish.js");
const User = require("../models/users.js");
const Payments = require("../models/payments.js");
const { deleteImage } = require("./oceanServices.js");
const { newError } = require("./services.js");
const mongoose = require("mongoose");
const axios = require("axios");
const crypto = require("crypto");

async function changeUserPass(userId, newPass) {
  User.findByIdAndUpdate(userId, { $set: { password: newPass } }).catch((e) => {
    throw newError("Zmiana hasła nie powiodła się.", 500);
  });
}

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

async function addDishToRestaurant(restaurantId, dishId) {
  await Restaurant.updateOne(
    { _id: restaurantId },
    { $push: { dishes: dishId } }
  ).catch((error) => {
    throw newError("Nie udało się dodać dania do restauracji", 500);
  });
}

async function addRestaurantToUser(user, restaurant) {
  await User.findByIdAndUpdate(user.id, {
    $push: { restaurants: restaurant._id },
  }).catch((e) => {
    throw newError("Nie udało się dodać restauracji do użytkownika", 500);
  });
}

function dueDateBasedOnSubscription(restaurant, monthsToAdd) {
  let date;
  if (
    restaurant.subscriptionActive === false ||
    !restaurant.subscriptionActive
  ) {
    date = new Date();
    date.setMonth(date.getMonth() + monthsToAdd);
    return date;
  } else {
    date = restaurant.subscriptionDue;
    date.setMonth(date.getMonth() + monthsToAdd);
    return date;
  }
}

function startDate(restaurant) {
  let date;
  if (
    restaurant.subscriptionActive === true &&
    restaurant.subscriptionStarted
  ) {
    date = restaurant.subscriptionStarted;
    return date;
  } else {
    date = new Date();
    return date;
  }
}

async function renewSubscription(restaurantId, monthsToAdd) {
  const restaurant = await Restaurant.findById(restaurantId).catch((err) => {
    throw newError("Nie udało się pobrać restauracji.", 404);
  });
  const dueDate = dueDateBasedOnSubscription(restaurant, monthsToAdd);
  const start = startDate(restaurant);
  await Restaurant.findByIdAndUpdate(restaurantId, {
    $set: {
      subscriptionActive: true,
      subscriptionDue: dueDate,
      subscriptionStarted: start,
    },
  }).catch((e) => {
    throw newError(
      "Nie udało się przedłużyć subskrypcji, spróbuj ponownie.",
      500
    );
  });
  return dueDateBasedOnSubscription(restaurant, monthsToAdd);
}

async function startTrial(restaurantId, userData) {
  const restaurant = await Restaurant.findById(restaurantId).catch((err) => {
    throw newError("Nie udało się pobrać restauracji.", 404);
  });
  if (!userData.trialUsed || userData.trialUsed === false) {
    const dueDate = dueDateBasedOnSubscription(restaurant, 3);
    const start = startDate(restaurant);
    await Restaurant.findByIdAndUpdate(restaurantId, {
    $set: {
      subscriptionActive: true,
      subscriptionDue: dueDate,
      subscriptionStarted: start,
    },
    }).catch((e) => {
    throw newError(
      "Nie udało się aktywować okresu próbnego.",
      500
    );
    });
    await User.findByIdAndUpdate(userData.id, { $set: { trialUsed: true } }).catch((e) => {
      throw newError("Błąd podczas aktywacji okresu próbnego (user data)")
    })
  } else {
    throw newError("Okres próbny został już wykorzystany.", 500);
  }
}

async function checkIfCategoryExists(restaurant, category) {
  const categories = restaurant.categories;
  if (categories.includes(category)) {
    throw newError("Podana kategoria już istnieje", 200);
  }
}

async function checkIfSetAlreadyInLunchMenu(restaurant, setName) {
  const lunchMenu = restaurant.lunchMenu;
  for (lunchSet of lunchMenu) {
    if (lunchSet.lunchSetName === setName) {
      throw newError("Nazwa zestawu jest zajęta", 409);
    }
    return;
  }
}

async function checkIfAlreadyInSet(restaurant, setName, dishId) {
  const lunchMenu = restaurant.lunchMenu;
  for (const lunchSet of lunchMenu) {
    if (lunchSet.lunchSetName === setName) {
      const dishes = lunchSet.lunchSetDishes;
      if (dishes.includes(dishId)) {
        throw newError("Danie jest już w podanym zestawie", 500);
      }
    }
  }
}

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

async function setDishVisibility(dishId, visible) {
  await Dish.findByIdAndUpdate(dishId, { $set: { hidden: !visible } }).catch(
    (e) => {
      throw newError("Nie udało się zmienić dania.", 500);
    }
  );
}

async function changeLunchMenuSet(restaurantId, action, lunchSet) {
  if (action === "add") {
    const restaurant = await Restaurant.findById(restaurantId).catch((err) => {
      throw newError("Nie udało się pobrać restauracji.", 404);
    });
    await checkIfSetAlreadyInLunchMenu(restaurant, lunchSet.lunchSetName);
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $push: { lunchMenu: lunchSet },
    }).catch((e) => {
      throw newError("Nie udało się dodać zestawu do lunch menu.", 500);
    });
  } else if (action === "delete") {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $pull: { lunchMenu: lunchSet },
    }).catch((e) => {
      throw newError("Nie udało się usunąć zestawu.", 500);
    });
  } else {
    throw newError("Nie sprecyzowano akcji", 500);
  }
}

function appendDishToLunchSet(lunchMenu, setName, dishId, quantity) {
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
  console.log("remove called")
  const result = lunchMenu.map((lunchSet) => {
    if (lunchSet.lunchSetName === setName) {
      let updatedSet = lunchSet;
      const index = updatedSet.lunchSetDishes.findIndex((dish) => {
        return dish.dishId.toString() === dishId.toString();
      });
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

async function changeLunchMenu(restaurantId, setName, dishId, quantity, action) {
  if (action === "add") {
    const restaurant = await Restaurant.findById(restaurantId).catch((err) => {
      throw newError("Nie udało się pobrać restauracji.", 404);
    });
    await checkIfAlreadyInSet(restaurant, setName, dishId);
    const updatedLunchMenu = appendDishToLunchSet(
      restaurant.lunchMenu,
      setName,
      dishId, 
      quantity
    );
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $set: { lunchMenu: updatedLunchMenu },
    }).catch((e) => {
      throw newError("Nie udało się dodać dania do lunch menu.", 500);
    });
  } else if (action === "delete") {
    const restaurant = await Restaurant.findById(restaurantId).catch((err) => {
      throw newError("Nie udało się pobrać restauracji.", 404);
    });
    const updatedLunchMenu = removeDishFromLunchSet(
      restaurant.lunchMenu,
      setName,
      dishId
    );
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $set: { lunchMenu: updatedLunchMenu },
    }).catch((e) => {
      throw newError("Nie udało się usunąć dania.", 500);
    });
  } else {
    throw newError("Nie sprecyzowano akcji", 500);
  }
}

async function fetchRestaurant(id) {
  const data = await Restaurant.findById(id).catch((e) => {
    throw newError("Nie udało się pobrać restauracji.", 500);
  });
  return data;
}

async function fetchMultipleRestaurants(idArray) {
  let data = await Restaurant.find().where('_id').in(idArray).exec();
  return data;
}

async function fetchAllDishesForRestaurant(restaurant) {
  const idList = restaurant.dishes;
  const dishes = await Dish.find({ '_id': { $in: idList } });
  return dishes;
}

async function fetchDish(id) {
  let data = await Dish.findById(id).catch((e) => {
    throw newError(`Nie udało się pobrać ${id}`, 404);
  });
  return data;
}

async function fetchUser(email) {
  if (!email) throw newError("Brak danych", 204);
  const user = await User.findOne({ email: email });
  if (!user) throw newError("Użytkownik nie istnieje", 404);
  return user;
}

function amountFromType(type) {
  if (type === 1) {
    return 6150;
  } else if (type === 12) {
    return 61500;
  } else {
    return 0;
  }
}

function controlSum(sessionId, merchantId, amount, currency) {
  const input = {
    sessionId: sessionId,
    merchantId: merchantId,
    amount: amount,
    currency: currency,
    crc: "???? wie co tu ma być",
  };
  let hash = crypto.createHash("sha384");
  const checkSum = hash.update(input, "utf8");
  return checkSum;
}

async function registerTransaction(paymentInfo, userData) {
  const data = {
    merchantId: 11111,
    posId: paymentInfo.type,
    sessionId: paymentInfo._id,
    amount: paymentInfo.amount,
    currency: "PLN",
    description: `Subskrypcja Menui na: ${paymentInfo.months} miesięcy.`,
    email: userData.userEmail,
    client: `${userData.firstname} ${userData.lastname}`,
    country: "PL",
    language: "pl",
    urlReturn: "http://test.pl",
    sign: controlSum(paymentInfo._id, 11111, paymentInfo.amount, "PLN"),
  };
  const response = await axios({
    method: "POST",
    url: "https://sandbox.przelewy24.pl/api/v1",
    data: data,
  }).catch((error) => {
    console.log(error);
    throw newError("Błąd.", 500);
  });
  return response;
}

async function initializePayment(restaurantId, userData, type) {
  const newPayment = new Payments({
    _id: new mongoose.Types.ObjectId(),
    restaurantId: restaurantId,
    amount: amountFromType(type),
    months: type,
  });
  const payment = await registerTransaction(newPayment, userData);
  newPayment.save();
  return payment;
}

async function setRestaurantVisibility(restaurantId, visible) {
  await Restaurant.findByIdAndUpdate(restaurantId, { $set: { hidden: !visible } }).catch(
    (e) => {
      throw newError("Nie udało się zmienić dania.", 500);
    }
  );
}

exports.changeUserPass = changeUserPass;
exports.removeDish = removeDish;
exports.removeRestaurant = removeRestaurant;
exports.addDishToRestaurant = addDishToRestaurant;
exports.addRestaurantToUser = addRestaurantToUser;
exports.renewSubscription = renewSubscription;
exports.changeCategory = changeCategory;
exports.setDishVisibility = setDishVisibility;
exports.changeLunchMenuSet = changeLunchMenuSet;
exports.changeLunchMenu = changeLunchMenu;
exports.fetchRestaurant = fetchRestaurant;
exports.fetchMultipleRestaurants = fetchMultipleRestaurants;
exports.fetchAllDishesForRestaurant = fetchAllDishesForRestaurant;
exports.fetchDish = fetchDish;
exports.fetchUser = fetchUser;
exports.initializePayment = initializePayment;
exports.setRestaurantVisibility = setRestaurantVisibility;
exports.startTrial = startTrial;
