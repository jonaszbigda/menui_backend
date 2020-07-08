require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = 3000;
const Restaurant = require("./models/restaurant");
const Dish = require("./models/dish");
const User = require("./models/users");
const validators = require("./validation");

mongoose.connect(
  "mongodb+srv://menui_db_user:" +
    process.env.DB_PASS +
    "@menui-database.9quwf.mongodb.net/<dbname>?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) console.log(err);
    else console.log("Connected To Database");
  }
);

// GET A PARTICULAR RESTAURANT //

app.get("/restaurant/:restaurantId", function (req, res) {
  Restaurant.findById(req.params.restaurantId, (err, data) => {
    if (err) res.send(err);
    else res.send(data);
  });
});

// GET RESTAURANTS IN A SPECIFIED CITY //

app.get("/city/:cityName", function (req, res) {
  Restaurant.find({ city: decodeURI(req.params.cityName) }, (err, data) => {
    if (err) res.send(err);
    else res.send(data);
  });
});

// ADD NEW RESTAURANT //

app.post("/restaurant", (req, res) => {
  const restaurant = new Restaurant({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    city: req.body.city,
    imgUrl: req.body.imgUrl,
    workingHours: req.body.workingHours,
    hidden: req.body.hidden,
  });
  restaurant.save().catch((err) => console.log(err));
  res.status(201).json({
    message: "Restaurant Created",
    addedRestaurant: restaurant,
  });
});

// ADD NEW DISH //

app.post("/dish", (req, res) => {
  const restaurantId = req.body.restaurantId;
  const userData = req.body.userData;
  const dish = new Dish({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    category: req.body.category,
    price: req.body.price,
    notes: req.body.notes,
    imgUrl: req.body.imgUrl,
    weight: req.body.weight,
    allergens: {
      gluten: req.body.gluten,
      lactose: req.body.lactose,
      soy: req.body.soy,
      eggs: req.body.eggs,
      seaFood: req.body.seaFood,
      peanuts: req.body.peanuts,
      sesame: req.body.sesame,
    },
    vegan: req.body.vegan,
    vegetarian: req.body.vegetarian,
  });
});

app.listen(port, () => console.log("Menui back-end is listening at: " + port));
