import express from "express";
import Restaurant from "../models/restaurant.js";
import mongoose from "mongoose";

var router = express.Router();

router.get("/", (req, res) => {
  Restaurant.find({ city: req.query.city }, (err, data) => {
    if (err) {
      res.sendStatus(404);
    } else res.send(data);
  });
});

export default router;
