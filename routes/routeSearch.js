import express from "express";
import * as services from "../services/services.js";
import Restaurant from "../models/restaurant.js";
import sanitizer from "string-sanitizer";
import restaurant from "../models/restaurant.js";

var router = express.Router();

// AUTOCOMPLETE

router.get("/autocomplete/", (req, res) => {
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
  ).limit(10);
});

export default router;
