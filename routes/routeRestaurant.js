import express from "express";
import * as validators from "../services/validation.js";
import Restaurant from "../models/restaurant.js";
import Dish from "../models/dish.js";
import User from "../models/users.js";
import sanitizer from "string-sanitizer";

var router = express.Router();

router.get("/", (req, res) => {
  validators.validateRestaurant(req.body.restaurantId, (result) => {
    if (!result) {
      res.sendStatus(400);
    } else {
      Restaurant.findById(req.body.restaurantId, (err, data) => {
        if (err) {
          res.sendStatus(404);
        } else res.send(data);
      });
    }
  });
});

router.post("/", (req, res) => {
  //validate user
  validators.validateUser(req.body.userId, (result) => {
    if (!result) res.sendStatus(401);
    //create restaurant
    const restaurant = new Restaurant({
      _id: new mongoose.Types.ObjectId(),
      name: sanitizer.sanitize.keepUnicode(req.body.name),
      city: sanitizer.sanitize.keepUnicode(req.body.city),
      imgUrl: req.body.imgUrl,
      workingHours: req.body.workingHours,
      hidden: req.body.hidden,
    });
    //add restaurant to DB
    restaurant.save((err) => {
      if (err) {
        res.sendStatus(400);
      } else {
        res.status(201);
      }
    });
  });
});

router.get("/dishes", (req, res) => {
  //validate restaurant
  validators.validateRestaurant(req.body.restaurantId, (result) => {
    if (!result) {
      res.sendStatus(400);
    } else {
      //get restaurant
      Restaurant.findById(req.body.restaurantId, (err, result) => {
        if (err) {
          res.sendStatus(404);
        } else {
          //prepare variables
          const dishesCount = result.dishes.length;
          let dishes = [];
          //fetch all dishes
          result.dishes.forEach((element) => {
            Dish.findById(element, (err, result) => {
              if (err) console.log("ERROR fetching dish");
              dishes.push(result);
              if (dishes.length == dishesCount) res.send(dishes);
            });
          });
        }
      });
    }
  });
});

export default router;
