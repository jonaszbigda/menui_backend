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

// LOGIN
router.post("/login", async (req, res) => {
  try {
    if (!req.body.password || !req.body.email) {
      throw services.newError("No input data", 204);
    }
    const user = await services.fetchUser(req.body.email);
    /* await services.checkPassword(req.body.password, user.password);
    const userNoPass = {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      id: user._id,
    };
    var token = services.generateAuthToken(userNoPass);
    res.header("x-auth-token", token).status(202).send(userNoPass); */
    res.send(user);
  } catch (error) {
    services.handleError(error, res);
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    await services.checkEmailTaken(req.body.email);
    const password = await services.hashPass(req.body.password);
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      email: req.body.email,
      password: password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
    });
    await user.save();
    const contact = services.composeNewContact(user);
    agileAPI.contactAPI.add(contact, success, error);
    res.sendStatus(201);
  } catch (e) {
    services.handleError(e, res);
  }
});

export default router;
