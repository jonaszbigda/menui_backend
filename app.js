require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const multer = require("multer");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;
const Restaurant = require("./models/restaurant");
const Dish = require("./models/dish");
const User = require("./models/users");
const validators = require("./validation");
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
const upload = multer({ storage: storage, limits: { fileSize: 4000000 } });

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
    if (!result) res.sendStatus(400);
    Restaurant.findById(req.body.restaurantId, (err, data) => {
      if (err) res.sendStatus(404);
      else res.send(data);
    });
  });
});

// GET RESTAURANTS IN A SPECIFIED CITY

app.get("/city", function (req, res) {
  Restaurant.find({ city: req.body.city }, (err, data) => {
    if (err) res.sendStatus(404);
    else res.send(data);
  });
});

// GET DISH BY ID

app.get("/dish", (req, res) => {
  Dish.findById(req.body.dishId, (err, data) => {
    if (err) res.sendStatus(404);
    res.send(data);
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
      name: req.body.name,
      city: req.body.city,
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
            name: req.body.dish.name,
            category: req.body.dish.category,
            price: req.body.dish.price,
            notes: req.body.dish.notes,
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
          Dish.replaceOne({ _id: req.body.dishId }, req.body.dish, (err) => {
            if (err) {
              res.sendStatus(304);
            } else {
              console.log("Dish Replaced with: " + req.body.dish);
              res.sendStatus(200);
            }
          });
        }
      });
    }
  });
});

app.post("/img", upload.single("menuiImage"), (req, res) => {
  res.sendStatus(201);
});

app.listen(port, () => console.log("Menui listening at: " + port));
