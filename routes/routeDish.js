import express from "express";
import Restaurant from "../models/restaurant.js";
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
    const dish = services.createDish(req.body.dish, true);
    await dish.save();
    await services.addDishToRestaurant(req.body.restaurantId, dish._id);
  } catch (error) {
    services.handleError(error, res);
  }
});

// UPDATE DISH

router.put("/", async (req, res) => {
  try {
    services.validateDishId(req.body.dishId);
    const token = req.headers["x-auth-token"];
    services.validateUserToken(token);
    const dish = services.createDish(req.body.dish, false);
    await Dish.replaceOne({ _id: req.body.dishId }, dish);
    res.sendStatus(200);
  } catch (error) {
    services.handleError(error, res);
  }
});

export default router;
