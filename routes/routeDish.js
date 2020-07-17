import express from "express";
import Restaurant from "../models/restaurant.js";
import Dish from "../models/dish.js";
import sanitizer from "string-sanitizer";

var router = express.Router();

router.get("/", (req, res) => {
  Dish.findById(req.body.dishId, (err, data) => {
    if (err) {
      res.sendStatus(404);
    } else res.send(data);
  });
});

router.post("/", (req, res) => {
  //validate restaurant
  validators.validateRestaurant(req.body.restaurantId, (result) => {
    if (!result) res.sendStatus(400);
    else {
      //validate user
      validators.validateUser(req.body.userId, (result) => {
        if (!result) {
          res.sendStatus(401);
        } else {
          //construct dish
          const dish = new Dish({
            _id: new mongoose.Types.ObjectId(),
            name: sanitizer.sanitize.keepUnicode(req.body.dish.name),
            category: req.body.dish.category,
            price: req.body.dish.price,
            notes: sanitizer.sanitize.keepUnicode(req.body.dish.notes),
            imgUrl: req.body.dish.imgUrl,
            weight: req.body.dish.weight,
            allergens: {
              gluten: req.body.dish.allergens.gluten,
              lactose: req.body.dish.allergens.lactose,
              soy: req.body.dish.allergens.soy,
              eggs: req.body.dish.allergens.eggs,
              seaFood: req.body.dish.allergens.seaFood,
              peanuts: req.body.dish.allergens.peanuts,
              sesame: req.body.dish.allergens.sesame,
            },
            vegan: req.body.dish.vegan,
            vegetarian: req.body.dish.vegetarian,
          });
          //add dish to DB
          dish.save((err) => {
            if (err) {
              res.sendStatus(400);
            } else {
              //add dish ID to restaurant
              Restaurant.updateOne(
                { _id: req.body.restaurantId },
                { $push: { dishes: dish._id } },
                (err) => {
                  if (err) {
                    res.sendStatus(400);
                  } else {
                    res.sendStatus(201);
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

router.put("/", (req, res) => {
  //validate dish ID
  validators.validateDishId(req.body.dishId, (result) => {
    if (!result) {
      res.sendStatus(204);
    } else {
      //validate user
      validators.validateUser(req.body.userId, (result) => {
        if (!result) {
          res.sendStatus(401);
        } else {
          //replace dish in DB
          Dish.replaceOne(
            { _id: req.body.dishId },
            {
              name: sanitizer.sanitize.keepUnicode(req.body.dish.name),
              category: req.body.dish.category,
              price: req.body.dish.price,
              notes: sanitizer.sanitize.keepUnicode(req.body.dish.notes),
              imgUrl: req.body.dish.imgUrl,
              weight: req.body.dish.weight,
              allergens: {
                gluten: req.body.dish.allergens.gluten,
                lactose: req.body.dish.allergens.lactose,
                soy: req.body.dish.allergens.soy,
                eggs: req.body.dish.allergens.eggs,
                seaFood: req.body.dish.allergens.seaFood,
                peanuts: req.body.dish.allergens.peanuts,
                sesame: req.body.dish.allergens.sesame,
              },
              vegan: req.body.dish.vegan,
              vegetarian: req.body.dish.vegetarian,
            },
            (err) => {
              if (err) {
                res.sendStatus(304);
              } else {
                res.sendStatus(200);
              }
            }
          );
        }
      });
    }
  });
});

export default router;
