import express from "express";
import { createRestaurant } from "../services/dataPrepServices.js";
import {
  addRestaurantToUser,
  fetchRestaurant,
  fetchAllDishesForRestaurant,
  removeRestaurant,
} from "../services/databaseServices.js";
import {
  decodeAndSanitize,
  validateRestaurant,
  handleError,
  validateUserToken,
  verifyRestaurantAccess,
} from "../services/services.js";
import Restaurant from "../models/restaurant.js";

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
    const restaurant = createRestaurant(req.body);
    await restaurant.save();
    await addRestaurantToUser(user, restaurant);
    res.sendStatus(201);
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

// DELETE RESTAURANT

router.post("/delete", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const user = validateUserToken(token);
    await validateRestaurant(req.body.restaurantId);
    await verifyRestaurantAccess(req.body.restaurantId, user);
    await removeRestaurant(req.body.restaurantId, user.id);
    res.send("Restauracja została pomyślnie usunięta.");
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
