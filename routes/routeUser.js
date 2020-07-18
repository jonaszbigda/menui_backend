import express from "express";
import mongoose from "mongoose";
import User from "../models/users.js";
import jwt from "jsonwebtoken";
import * as config from "../config/index.js";
const { API_KEY, jwtSecret } = config;

var router = express.Router();

router.post("/login", (req, res) => {
  console.log("gds");
});

export default router;
