import express from "express";
import Restaurant from "../models/restaurant.js";
import * as services from "../services/services.js";
import sanitizer from "string-sanitizer";
import Dish from "../models/dish.js";

var router = express.Router();

// GET DISH BY ID

router.get("/", (req, res) => {
  Dish.findById(req.query.dishId, (err, data) => {
    if (err) {
      res.sendStatus(404);
    } else
      res
        .cookie("img", encodeURI(data.imgUrl), { maxAge: 1000 * 600 })
        .send(data);
  });
});

// ADD NEW DISH

router.post("/", (req, res) => {
  services.validateRestaurant(req.body.restaurantId, (result) => {
    if (!result) {
      res.sendStatus(400);
    } else {
      const token = req.headers["x-auth-token"];
      if (!token) {
        res.sendStatus(401);
        return;
      }
      services.validateUserToken(token, (result) => {
        if (!result) {
          res.sendStatus(401);
        } else {
          const dish = services.createDish(
            req.body.dish,
            req.cookies["img"],
            true
          );
          dish.save((err) => {
            if (err) {
              res.sendStatus(400);
            } else {
              Restaurant.updateOne(
                { _id: req.body.restaurantId },
                { $push: { dishes: dish._id } },
                (err) => {
                  if (err) {
                    res.sendStatus(400);
                  } else {
                    res.clearCookie("img").status(201).send();
                  }
                }
              );
            }
          });
        }
      });
    }
  });
});

// UPDATE DISH

router.put("/", (req, res) => {
  services.validateDishId(req.body.dishId, (result) => {
    if (!result) {
      res.sendStatus(204);
    } else {
      const token = req.headers["x-auth-token"];
      if (!token) {
        res.sendStatus(401);
        return;
      }
      services.validateUserToken(token, (result) => {
        if (!result) {
          res.sendStatus(401);
        } else {
          const dish = services.createDish(
            req.body.dish,
            req.cookies["img"],
            false
          );
          Dish.replaceOne({ _id: req.body.dishId }, dish, (err) => {
            if (err) {
              res.sendStatus(304);
            } else {
              res.clearCookie("img").status(200).send();
            }
          });
        }
      });
    }
  });
});

export default router;
