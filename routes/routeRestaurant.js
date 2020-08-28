import express from "express";
import { createRestaurant } from "../services/dataPrepServices.js";
import {
  addRestaurantToUser,
  fetchRestaurant,
  fetchAllDishesForRestaurant,
} from "../services/databaseServices.js";
import * as services from "../services/services.js";
import Restaurant from "../models/restaurant.js";

var router = express.Router();

// GET RESTAURANT BY ID

router.get("/", async (req, res) => {
  try {
    const query = services.decodeAndSanitize(req.query.restaurantId);
    await services.validateRestaurant(query);
    Restaurant.findById(query).then((data) => res.send(data));
  } catch (error) {
    services.handleError(error, res);
  }
});

// ADD NEW RESTAURANT

router.post("/", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const user = services.validateUserToken(token);
    const restaurant = createRestaurant(req.body);
    await restaurant.save();
    await addRestaurantToUser(user, restaurant);
    res.sendStatus(201);
  } catch (error) {
    services.handleError(error, res);
  }
});

// GET ALL DISHES FROM A RESTAURANT ID

router.get("/dishes", async (req, res) => {
  try {
    const query = services.decodeAndSanitize(req.query.restaurantId);
    await services.validateRestaurant(query);
    let restaurant = await fetchRestaurant(query);
    let dishes = await fetchAllDishesForRestaurant(restaurant);
    res.send(dishes);
  } catch (error) {
    services.handleError(error, res);
  }
});

export default router;
