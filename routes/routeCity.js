import express from "express";
import Restaurant from "../models/restaurant.js";

var router = express.Router();

router.get("/", (req, res) => {
  Restaurant.find({ city: req.body.city }, (err, data) => {
    if (err) {
      res.sendStatus(404);
    } else res.send(data);
  });
});

export default router;
