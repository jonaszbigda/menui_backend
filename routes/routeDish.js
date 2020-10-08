const express = require("express");
const { createDish } = require("../services/dataPrepServices.js");
const {
  removeDish,
  fetchDish,
  addDishToRestaurant,
  setDishVisibility,
} = require("../services/databaseServices.js");
const {
  validateRestaurant,
  validateUserToken,
  validateDishId,
  handleError,
  verifyDishAccess,
} = require("../services/services.js");
const Dish = require("../models/dish.js");

var router = express.Router();

// GET DISH BY ID

router.get("/", (req, res) => {
  Dish.findById(req.query.dishId, (err, data) => {
    if (err) {
      res.sendStatus(404);
    } else res.send(data);
  });
});

// ADD NEW DISH

router.post("/", async (req, res) => {
  try {
    await validateRestaurant(req.body.restaurantId);
    const token = req.headers["x-auth-token"];
    validateUserToken(token);
    const dish = await createDish(req.body, req.body.restaurantId);
    await dish.save();
    await addDishToRestaurant(req.body.restaurantId, dish._id);
    res.status(201).send(dish._id);
  } catch (error) {
    handleError(error, res);
  }
});

// HIDE, UNHIDE DISH

router.post("/hidden", async (req, res) => {
  try {
    await validateDishId(req.body.dishId);
    const token = req.headers["x-auth-token"];
    validateUserToken(token);
    await setDishVisibility(req.body.dishId, req.body.visible);
    res.sendStatus(200);
  } catch (error) {
    handleError(error, res);
  }
});

// REMOVE DISH

router.delete("/", async (req, res) => {
  try {
    await validateDishId(req.body.dishId);
    const token = req.headers["x-auth-token"];
    const decodedToken = validateUserToken(token);
    await verifyDishAccess(req.body.dishId, decodedToken);
    await removeDish(req.body.dishId);
    res.sendStatus(200);
  } catch (error) {
    handleError(error, res);
  }
});

// UPDATE DISH

router.put("/", async (req, res) => {
  try {
    await validateDishId(req.body.dishId);
    const token = req.headers["x-auth-token"];
    const decodedToken = validateUserToken(token);
    await verifyDishAccess(req.body.dishId, decodedToken);
    const oldDish = await fetchDish(req.body.dishId);
    const dish = await createDish(req.body, req.body.restaurantId, oldDish);
    await Dish.replaceOne({ _id: req.body.dishId }, dish);
    res.send(dish);
  } catch (error) {
    handleError(error, res);
  }
});

module.exports = router;
