const express = require("express");
const Restaurant = require("../models/restaurant.js");
const sanitizer = require("string-sanitizer");
const { handleError } = require("../services/services.js");

var router = express.Router();

// SEARCH RESTAURANTS BY NAME OR CITY

router.get("/", async (req, res) => {
  try {
    if (req.query.string.length > 0) {
      const query = sanitizer.sanitize.keepUnicode(decodeURI(req.query.string));
      const regex = new RegExp(query, "i");

      Restaurant.find(
        {
          $and: [
            { $or: [{ city: { $regex: regex } }, { name: { $regex: regex } }] },
            { $or: [{ hidden: false }, { hidden: { $exists: false } }] },
            { subscriptionActive: true },
          ],
        },
        "_id name city adress type imgUrl workingHours description tags location"
      )
        .then((response) => {
          res.send(response);
        })
        .catch((err) => {
          console.log(err);
          res.sendStatus(500);
        });
    } else {
      res.send({
        results: [],
      });
    }
  } catch (error) {
    console.log(error);
    res.send({
      results: [],
    });
  }
});

// TEST

router.get("/test/", (req, res) => {
  res.send(req.query.string);
});

// SEARCH RESTAURANTS BY LOCATION

router.get("/location", async (req, res) => {
  try {
    const location = {
      coordinates: [req.query.lon, req.query.lat],
      type: "Point",
    };
    const radius = parseInt(req.query.radius) * 1000;
    const results = await Restaurant.find({
      location: { $near: { $maxDistance: radius, $geometry: location } },
    });
    res.send(results);
  } catch (error) {
    handleError(error, res);
  }
});

// AUTOCOMPLETE

router.get("/autocomplete/", (req, res) => {
  if (req.query.string.length > 0) {
    var query = sanitizer.sanitize.keepUnicode(decodeURI(req.query.string));
    const regex = new RegExp(query, "i");
    let cities = new Set();
    let restaurants = new Set();

    Restaurant.find(
      { $or: [{ city: { $regex: regex } }, { name: { $regex: regex } }] },
      "name city",
      (err, doc) => {
        if (err) {
          res.sendStatus(404);
        } else {
          doc.forEach((value) => {
            if(value.city.search(regex) !== -1){
              cities.add(value.city);
            }
            if(value.name.search(regex) !== -1){
              restaurants.add(value.name);
            }
          });
          res.send({
            cities: Array.from(cities),
            restaurants: Array.from(restaurants),
          });
        }
      }
    ).limit(10);
  } else {
    res.send({
      cities: [],
      restaurants: [],
    });
  }
});

module.exports = router;
