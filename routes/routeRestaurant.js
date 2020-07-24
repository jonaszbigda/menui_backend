import express from "express";
import * as services from "../services/services.js";
import Restaurant from "../models/restaurant.js";
import Dish from "../models/dish.js";
import sanitizer from "string-sanitizer";
import mongoose from "mongoose";

var router = express.Router();

// GET RESTAURANT BY ID

router.get("/", (req, res) => {
  if (req.query.restaurantId.length > 0) {
    const query = sanitizer.sanitize.keepUnicode(
      decodeURI(req.query.restaurantId)
    );
    services.validateRestaurant(query, (result) => {
      if (!result) {
        res.sendStatus(400);
      } else {
        Restaurant.findById(query, (err, data) => {
          if (err) {
            res.sendStatus(404);
          } else res.send(data);
        });
      }
    });
  } else {
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
        imgUrl: services.saveImage(req.cookies["img"]),
        workingHours: req.body.workingHours,
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

router.get("/dishes", (req, res) => {
  if (req.query.restaurantId.length > 0) {
    const query = sanitizer.sanitize.keepUnicode(
      decodeURI(req.query.restaurantId)
    );

    services.validateRestaurant(query, (result) => {
      if (!result) {
        res.sendStatus(400);
      } else {
        Restaurant.findById(query, (err, result) => {
          if (err) {
            res.sendStatus(404);
          } else {
            const dishesCount = result.dishes.length;
            let dishes = [];
            result.dishes.forEach((element) => {
              Dish.findById(element, (err, result) => {
                if (err) {
                  console.log("ERROR fetching dish");
                } else {
                  dishes.push(result);
                  if (dishes.length == dishesCount) res.send(dishes);
                }
              });
            });
          }
        });
      }
    });
  } else {
    res.sendStatus(404);
  }
});

export default router;
