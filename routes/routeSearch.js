import express from "express";
import * as services from "../services/services.js";
import Restaurant from "../models/restaurant.js";
import sanitizer from "string-sanitizer";
import restaurant from "../models/restaurant.js";

var router = express.Router();

// SEARCH RESTAURANTS BY NAME OR CITY

router.get("/", (req, res) => {
  if (req.query.string.length > 0) {
    const query = sanitizer.sanitize.keepUnicode(decodeURI(req.query.string));
    const regex = new RegExp(query, "i");

    Restaurant.find(
      {
        $and: [
          { $or: [{ city: { $regex: regex } }, { name: { $regex: regex } }] },
          { hidden: false },
        ],
      },
      "_id name city imgUrl workingHours",
      (err, results) => {
        if (err) {
          res.sendStatus(500);
        } else {
          res.send(results);
        }
      }
    );
  } else {
    res.send({
      results: [],
    });
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
          res.send(404);
        } else {
          doc.forEach((value) => {
            cities.add(value.city);
            restaurants.add(value.name);
          });
          res.send({
            cities: Array.from(cities),
            restaurants: Array.from(restaurants),
          });
        }
      }
    ).limit(5);
  } else {
    res.send({
      cities: [],
      restaurants: [],
    });
  }
});

export default router;
