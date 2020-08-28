import express from "express";
import { createDish } from "../services/dataPrepServices.js";
import {
  removeDish,
  addDishToRestaurant,
} from "../services/databaseServices.js";
import * as services from "../services/services.js";
import Dish from "../models/dish.js";

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
    await services.validateRestaurant(req.body.restaurantId);
    const token = req.headers["x-auth-token"];
    services.validateUserToken(token);
    const dish = createDish(req.body.dish, req.body.restaurantId, true);
    await dish.save();
    await addDishToRestaurant(req.body.restaurantId, dish._id);
    res.status(201).send(dish._id);
  } catch (error) {
    services.handleError(error, res);
  }
});

// REMOVE DISH

router.delete("/", async (req, res) => {
  try {
    await services.validateDishId(req.body.dishId);
    const token = req.headers["x-auth-token"];
    const decodedToken = services.validateUserToken(token);
    await services.verifyDishAccess(req.body.dishId, decodedToken);
    await removeDish(req.body.dishId);
    res.sendStatus(200);
  } catch (error) {
    services.handleError(error, res);
  }
});

// UPDATE DISH

router.put("/", async (req, res) => {
  try {
    await services.validateDishId(req.body.dishId);
    const token = req.headers["x-auth-token"];
    services.validateUserToken(token);
    const dish = createDish(req.body.dish, req.body.restaurantId, false);
    await Dish.replaceOne({ _id: req.body.dishId }, dish);
    res.sendStatus(200);
  } catch (error) {
    services.handleError(error, res);
  }
});

export default router;
