/*


CONFIGS


*/
require("dotenv").config(); //require environment variables
const mongoose = require("mongoose");
const express = require("express");
const helmet = require("helmet");
const multer = require("multer");
const bcrypt = require("bcrypt");
const validators = require("./validation");
var sanitizer = require("string-sanitizer");
const app = express();
app.use(helmet());
const port = 3000;
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //time window
  max: 100, //requests from a single IP for a time window
});
app.use(limiter);
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "100kb" })); // limit body payload size
app.use(bodyParser.urlencoded({ extended: true }));
/*


Mongoose schemas


*/
const Restaurant = require("./models/restaurant");
const Dish = require("./models/dish");
const User = require("./models/users");
/*


Image upload config (multer)


*/
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date()
        .toISOString()
        .trim()
        .replace(/[:_ -.]/g, "") +
        Math.floor(Math.random() * 5000 + 1) +
        file.mimetype.replace("/", ".")
    );
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "image/jpg") {
      return cb(null, false);
    }
    cb(null, true);
  },
  limits: { fileSize: 4000000 },
}); //max file size = 4Mb
/*

Code

*/
// Connect to DB
mongoose.connect(
  "mongodb+srv://menui_db_user:" +
    process.env.DB_PASS +
    "@menui-database.9quwf.mongodb.net/<dbname>?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) console.log("Unable to connect :(");
    else console.log("Connected To Database");
  }
);

// GET RESTAURANT BY ID

app.get("/restaurant", function (req, res) {
  //validate restaurant
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

// GET RESTAURANTS IN A SPECIFIED CITY

app.get("/city", function (req, res) {
  Restaurant.find({ city: req.body.city }, (err, data) => {
    if (err) {
      res.sendStatus(404);
    } else res.send(data);
  });
});

// GET DISH BY ID

app.get("/dish", (req, res) => {
  Dish.findById(req.body.dishId, (err, data) => {
    if (err) {
      res.sendStatus(404);
    } else res.send(data);
  });
});

// ADD NEW RESTAURANT

app.post("/restaurant", (req, res) => {
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

// ADD NEW DISH

app.post("/dish", (req, res) => {
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

// GET ALL DISHES FROM A RESTAURANT ID (All at once)

app.get("/dishes", (req, res) => {
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

// UPDATE DISH

app.put("/dish", (req, res) => {
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

app.post("/img", upload.single("menuiImage"), (req, res) => {
  res.sendStatus(201);
});

app.listen(port, () => console.log("Menui listening at: " + port));
