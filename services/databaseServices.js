import Restaurant from "../models/restaurant.js";
import Dish from "../models/dish.js";
import User from "../models/users.js";
import { deleteImage } from "./azureServices.js";
import { newError } from "./services.js";

export async function changeUserPass(userId, newPass) {
  User.findByIdAndUpdate(userId, { $set: { password: newPass } }).catch((e) => {
    throw newError("Zmiana hasła nie powiodła się.", 500);
  });
}

export async function removeDish(dishId) {
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

export async function removeRestaurant(restaurantId, userId) {
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

export async function addDishToRestaurant(restaurantId, dishId) {
  await Restaurant.updateOne(
    { _id: restaurantId },
    { $push: { dishes: dishId } }
  ).catch((error) => {
    throw newError("Nie udało się dodać dania do restauracji", 500);
  });
}

export async function addRestaurantToUser(user, restaurant) {
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

export async function renewSubscription(restaurantId, monthsToAdd) {
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
  for (lunchSet of lunchMenu) {
    if (lunchSet.lunchSetName === setName) {
      const dishes = lunchSet.lunchSetDishes;
      if (dishes.includes(dishId)) {
        throw newError("Danie jest już w podanym zestawie", 500);
      }
    }
  }
}

export async function changeCategory(restaurantId, categoryName, action) {
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

export async function setDishVisibility(dishId, visible) {
  await Dish.findByIdAndUpdate(dishId, { $set: { hidden: !visible } }).catch(
    (e) => {
      throw newError("Nie udało się zmienić dania.", 500);
    }
  );
}

export async function changeLunchMenuSet(restaurantId, action, lunchSet) {
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

export async function changeLunchMenu(restaurantId, setName, dishId, action) {
  if (action === "add") {
    const restaurant = await Restaurant.findById(restaurantId).catch((err) => {
      throw newError("Nie udało się pobrać restauracji.", 404);
    });
    await checkIfAlreadyInSet(restaurant, setName, dishId);
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $push: { lunchMenu: dishId },
    }).catch((e) => {
      throw newError("Nie udało się dodać dania do lunch menu.", 500);
    });
  } else if (action === "delete") {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $pull: { lunchMenu: dishId },
    }).catch((e) => {
      throw newError("Nie udało się usunąć dania.", 500);
    });
  } else {
    throw newError("Nie sprecyzowano akcji", 500);
  }
}

export async function fetchRestaurant(id) {
  const data = await Restaurant.findById(id).catch((e) => {
    throw newError("Nie udało się pobrać restauracji.", 500);
  });
  return data;
}

export async function fetchMultipleRestaurants(idArray) {
  let data = [];
  for (const id of idArray) {
    let response = await fetchRestaurant(id);
    data.push(response);
  }
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
    throw newError(`Nie udało się pobrać ${id}`, 404);
  });
  return data;
}

export async function fetchUser(email) {
  if (!email) throw newError("Brak danych", 204);
  const user = await User.findOne({ email: email });
  if (!user) throw newError("Użytkownik nie istnieje", 404);
  return user;
}
