const express = require("express");
const { createRestaurant } = require("../services/dataPrepServices.js");
const {
  addRestaurantToUser,
  fetchRestaurant,
  fetchAllDishesForRestaurant,
  removeRestaurant,
  changeCategory,
  changeLunchMenu,
  changeLunchMenuSet,
  fetchUser,
  renewSubscription,
  setRestaurantVisibility,
  startTrial
} = require("../services/databaseServices.js");
const {
  decodeAndSanitize,
  validateRestaurant,
  handleError,
  validateUserToken,
  verifyRestaurantAccess,
  newError,
  checkPassword,
} = require("../services/services.js");
const Restaurant = require("../models/restaurant.js");

var router = express.Router();

// GET RESTAURANT BY ID

router.get("/", async (req, res) => {
  try {
    const query = decodeAndSanitize(req.query.restaurantId);
    await validateRestaurant(query);
    Restaurant.findById(query).then((data) => res.send(data));
  } catch (error) {
    handleError(error, res);
  }
});

// ADD NEW RESTAURANT

router.post("/", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const user = validateUserToken(token);
    const restaurant = await createRestaurant(req.body).catch((err) => {
      throw newError("Nie udało się zapisać zdjęcia.", 500);
    });
    await restaurant.save();
    await addRestaurantToUser(user, restaurant);
    res.sendStatus(201);
  } catch (error) {
    handleError(error, res);
  }
});

// UPDATE RESTAURANT

router.put("/", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const user = validateUserToken(token);
    const oldRestaurant = await fetchRestaurant(req.body.restaurantId);
    const newRestaurant = await createRestaurant(req.body, oldRestaurant);
    await verifyRestaurantAccess(req.body.restaurantId, user);
    await Restaurant.replaceOne({ _id: req.body.restaurantId }, newRestaurant);
    res.send(newRestaurant);
  } catch (error) {
    handleError(error, res);
  }
});

// GET ALL DISHES FROM A RESTAURANT ID

router.get("/dishes", async (req, res) => {
  try {
    const query = decodeAndSanitize(req.query.restaurantId);
    await validateRestaurant(query);
    let restaurant = await fetchRestaurant(query);
    let dishes = await fetchAllDishesForRestaurant(restaurant);
    res.send(dishes);
  } catch (error) {
    handleError(error, res);
  }
});

// CHANGE CATEGORY

router.post("/category", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const user = validateUserToken(token);
    await validateRestaurant(req.body.restaurantId);
    await verifyRestaurantAccess(req.body.restaurantId, user);
    await changeCategory(
      req.body.restaurantId,
      req.body.category,
      req.body.action
    );
    const restaurant = await fetchRestaurant(req.body.restaurantId);
    res.send(restaurant);
  } catch (error) {
    handleError(error, res);
  }
});

// CHANGE LUNCH MENU

router.post("/lunchSet", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const user = validateUserToken(token);
    await validateRestaurant(req.body.restaurantId);
    await verifyRestaurantAccess(req.body.restaurantId, user);
    await changeLunchMenuSet(
      req.body.restaurantId,
      req.body.action,
      req.body.set
    );
    res.sendStatus(200);
  } catch (error) {
    handleError(error, res);
  }
});

router.post("/lunch", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const user = validateUserToken(token);
    await validateRestaurant(req.body.restaurantId);
    await verifyRestaurantAccess(req.body.restaurantId, user);
    await changeLunchMenu(
      req.body.restaurantId,
      req.body.setName,
      req.body.dishId,
      req.body.action
    );
    res.sendStatus(200);
  } catch (error) {
    handleError(error, res);
  }
});

// DELETE RESTAURANT

router.post("/delete", async (req, res) => {
  try {
    if (!req.body.password) {
      throw newError("Niepełne dane.", 204);
    }
    const token = req.headers["x-auth-token"];
    validateUserToken(token);
    const user = await fetchUser(req.body.email);
    await checkPassword(req.body.password, user.password);
    await validateRestaurant(req.body.restaurantId);
    await verifyRestaurantAccess(req.body.restaurantId, user);
    await removeRestaurant(req.body.restaurantId, user._id);
    res.send("Restauracja została pomyślnie usunięta.");
  } catch (error) {
    handleError(error, res);
  }
});

// SET RESTAURANT VISIBILITY

router.post("/visibility", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const user = await validateUserToken(token);
    await validateRestaurant(req.body.restaurantId);
    await verifyRestaurantAccess(req.body.restaurantId, user);
    await setRestaurantVisibility(req.body.restaurantId, req.body.visible);
    res.send("Widoczność restauracji została zmieniona.");
  } catch (error) {
    handleError(error, res);
  }
})

// ACTIVATE SUBSCRIPTION

router.post("/subscription", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const user = validateUserToken(token);
    await validateRestaurant(req.body.restaurantId);
    /* const response = await initializePayment(
      req.body.restaurantId,
      req.body.userData,
      req.body.type
    ); */
    await renewSubscription(req.body.restaurantId, req.body.type);
    res.sendStatus(200);
  } catch (error) {
    handleError(error, res);
  }
});

// ACTIVATE TRIAL

router.post("/trial", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const user = validateUserToken(token);
    await startTrial(req.body.restaurantId, user);
    res.send("Okres próbny aktywowany.");
  } catch (error) {
    handleError(error, res);
  }
})

module.exports = router;
