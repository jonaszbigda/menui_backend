import express from "express";
import mongoose from "mongoose";
import User from "../models/users.js";
import bcrypt from "bcrypt";
import * as services from "../services/services.js";
import * as config from "../config/index.js";
import AgileCRMManager from "agile_crm";
const { API_KEY, jwtSecret } = config;

var router = express.Router();
var agileAPI = new AgileCRMManager("bankai", API_KEY, "bankai@bankai.pl");
var success = function (data) {
  console.log("Task successfull");
};
var error = function (err) {
  console.log("Task failed successfully");
};

router.post("/login", (req, res) => {
  if (req.body.password && req.body.email) {
    services.fetchUser(req.body.email, (result) => {
      if (!result) {
        res.sendStatus(404);
      } else {
        var user = result;
        bcrypt.compare(req.body.password, user.password, function (
          err,
          result
        ) {
          if (err) {
            res.sendStatus(500);
          } else {
            if (result) {
              const userNoPass = {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                id: user._id,
              };
              var token = services.generateAuthToken(userNoPass);
              res.header("x-auth-token", token).status(202).send(userNoPass);
            } else {
              res.sendStatus(401);
            }
          }
        });
      }
    });
  } else {
    res.sendStatus(404);
  }
});

router.post("/register", (req, res) => {
  services.checkEmailTaken(req.body.email, (result) => {
    if (result) {
      res.sendStatus(409);
    } else {
      services.hashPass(req.body.password, (hashedPass) => {
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          email: req.body.email,
          password: hashedPass,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
        });
        user.save((err) => {
          if (err) {
            res.sendStatus(500);
          } else {
            const contact = services.composeNewContact(user);
            agileAPI.contactAPI.add(contact, success, error);
            res.sendStatus(201);
          }
        });
      });
    }
  });
});

export default router;
