import express from "express";
import * as services from "../services/services.js";
import Restaurant from "../models/restaurant.js";
import sanitizer from "string-sanitizer";
import mongoose from "mongoose";

var router = express.Router();

// GET RESTAURANT BY ID

router.get("/", async (req, res) => {
  try {
    const query = services.decodeAndSanitize(req.query.restaurantId);
    await services.validateRestaurant(query);
    Restaurant.findById(query, (err, data) => {
      if (err) {
        res.sendStatus(404);
      } else res.send(data);
    });
  } catch (error) {
    res.sendStatus(404);
  }
});

// ADD NEW RESTAURANT

router.post("/", (req, res) => {
  const token = req.headers["x-auth-token"];
  if (!token) {
    res.sendStatus(401);
    return;
  }
  services.validateUserToken(token, (result) => {
    if (!result) {
      res.sendStatus(401);
    } else {
      const restaurant = new Restaurant({
        _id: new mongoose.Types.ObjectId(),
        name: sanitizer.sanitize.keepUnicode(req.body.name),
        city: sanitizer.sanitize.keepUnicode(req.body.city),
        imgUrl: services.saveImage(req.body.imgURL),
        workingHours: req.body.workingHours,
        description: sanitizer.sanitize.keepUnicode(req.body.description),
        tags: req.body.tags,
        links: req.body.links,
        phone: req.body.phone,
        hidden: req.body.hidden,
      });
      restaurant.save((err) => {
        if (err) {
          res.sendStatus(400);
        } else {
          res.clearCookie("img").status(201).send();
        }
      });
    }
  });
});

// GET ALL DISHES FROM A RESTAURANT ID

router.get("/dishes", async (req, res) => {
  try {
    const query = services.decodeAndSanitize(req.query.restaurantId);
    await services.validateRestaurant(query);
    let restaurant = await services.fetchRestaurant(query);
    let dishes = await services.fetchAllDishesForRestaurant(restaurant);
    res.send(dishes);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

export default router;
