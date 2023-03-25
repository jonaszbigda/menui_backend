const express = require("express");
const { fetchUser } = require("../services/databaseServices.js");
const {
  createUser,
  prepareSafeUser,
} = require("../services/dataPrepServices.js");
const { newError, handleError } = require("../services/services.js");
const cookie = require("cookie");
const { validateRegister } = require("../services/validations.js");

var router = express.Router();

// REFRESH
router.post("/refresh", async (req, res) => {
  try {
    const freshUser = await fetchUser(user.email);
    const safeUser = await prepareSafeUser(freshUser);
    res.send(safeUser);
  } catch (error) {
    handleError(error, res);
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    validateRegister(req.body);
    const user = await createUser(req);
    await user.save().catch((e) => {
      throw newError("Niewłaściwe dane.", 500);
    });
    res.sendStatus(201);
  } catch (e) {
    handleError(e, res);
  }
});

// CHANGE USER DATA
router.post("/edit", async (req, res) => {
  try {
    console.log("23");
  } catch (error) {
    handleError(error, res);
  }
});

module.exports = router;
