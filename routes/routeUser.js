import express from "express";
import mongoose from "mongoose";
import User from "../models/users.js";
import bcrypt from "bcrypt";
import * as services from "../services/services.js";
import * as config from "../config/index.js";
const { API_KEY, jwtSecret } = config;

var router = express.Router();

router.post("/login", (req, res) => {
  if (req.body.password && req.body.email) {
    services.fetchUserHash(req.body.email, (result) => {
      if (!result) {
        res.sendStatus(404);
      } else {
        var user = result;
        bcrypt.compare(req.body.password, user.password, function (
          err,
          result
        ) {
          if (result) {
            var token = services.generateAuthToken(user);
            res.header("x-auth-token", token).status(202).send();
          } else {
            res.sendStatus(401);
          }
        });
      }
    });
  } else {
    res.sendStatus(404);
  }
});

router.post("/check", (req, res) => {
  const token = req.headers["x-auth-token"];
  if (!token) {
    res.sendStatus(401);
    return;
  }
  services.validateUserToken(token, (result) => {
    if (!result) {
      res.sendStatus(401);
    } else {
      res.send(result);
    }
  });
});

router.post("/register", (req, res) => {
  if (req.body.key === API_KEY) {
    services.checkEmailTaken(req.body.email, (result) => {
      if (result) {
        res.sendStatus(409);
      } else {
        services.hashPass(req.body.password, (hashedPass) => {
          const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email: req.body.email,
            password: hashedPass,
            subscriptionActive: req.body.subscriptionActive,
            subscriptionDue: services.dueDateBasedOnSubscription(
              req.body.subscriptionActive
            ),
          });
          user.save((err) => {
            if (err) {
              res.sendStatus(500);
            } else {
              res.sendStatus(201);
            }
          });
        });
      }
    });
  } else {
    res.sendStatus(404);
  }
});

export default router;
