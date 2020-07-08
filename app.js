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

mongoose.connect(
  "mongodb+srv://menui_db_user:<" +
    process.env.DB_PASS +
    ">@menui-database.9quwf.mongodb.net/<dbname>?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) console.log(err);
    else console.log("Connected To Database");
  }
);

app.get("/", (req, res) => res.send("Hello World!"));

// TEST ONLY //

app.get("/restaurant", function (req, res) {
  Restaurant.find()
    .exec()
    .then((data) => {
      console.log(data);
    })
    .catch((err) => console.log(err));
});

// ADD NEW RESTAURANT

app.post("/restaurant", (req, res) => {
  const restaurant = new Restaurant({
    id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    city: req.body.city,
    imgUrl: req.body.imgUrl,
    workingHours: req.body.workingHours,
    hidden: req.body.hidden,
  });
  restaurant
    .save()
    .then((result) => {
      console.log(result);
    })
    .catch((err) => console.log(err));
  res.status(201).json({
    message: "Created a Restaurant in a Database",
    addedRestaurant: restaurant,
  });
});

/*app.get("/dish/:dishId", (req, res) => {
    const dishId = req.params.dishId;
})*/

app.listen(port, () => console.log("Listening at: " + port));
