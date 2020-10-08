const express = require("express");
const {
  changeUserPass,
  fetchUser,
} = require("../services/databaseServices.js");
const {
  createUser,
  prepareSafeUser,
} = require("../services/dataPrepServices.js");
const {
  newError,
  handleError,
  checkPassword,
  generateAuthToken,
  checkEmailTaken,
  validateUserToken,
  hashPass,
} = require("../services/services.js");
const { resetPassword } = require("../services/mailServices.js");

var router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {
  try {
    if (!req.body.password || !req.body.email) {
      throw newError("Niepełne dane.", 204);
    }
    const user = await fetchUser(req.body.email);
    await checkPassword(req.body.password, user.password);
    const safeUser = await prepareSafeUser(user);
    var token = generateAuthToken(safeUser);
    res.header("x-auth-token", token).status(202).send(safeUser);
  } catch (error) {
    handleError(error, res);
  }
});

// REFRESH
router.post("/refresh", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const user = validateUserToken(token);
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
    await checkEmailTaken(req.body.email);
    const user = await createUser(req);
    await user.save().catch((e) => {
      throw newError("Niewłaściwe dane.", 500);
    });
    res.sendStatus(201);
  } catch (e) {
    handleError(e, res);
  }
});

// CHANGE PASSWORD
router.post("/changepass", async (req, res) => {
  try {
    if (!req.body.password || !req.body.email || !req.body.newPass) {
      throw newError("Niepełne dane.", 204);
    }
    const token = req.headers["x-auth-token"];
    validateUserToken(token);
    const user = await fetchUser(req.body.email);
    await checkPassword(req.body.password, user.password);
    const newPassword = await hashPass(req.body.newPass);
    await changeUserPass(user._id, newPassword);
    res.status(200).send("Hasło zostało zmienione.");
  } catch (error) {
    handleError(error, res);
  }
});

// REQUEST PASSWORD RESET
router.post("/forgotpassword", async (req, res) => {
  try {
    await resetPassword(req.body.email);
    res.send(
      "Link do utworzenia nowego hasła został wysłany na adres email powiązany z kontem. Sprawdź również folder SPAM."
    );
  } catch (error) {
    handleError(error, res);
  }
});

// RESET PASS
router.post("/resetpass", async (req, res) => {
  try {
    validateUserToken(req.body.token);
    const user = await fetchUser(req.body.email);
    const newPassword = await hashPass(req.body.newPass);
    await changeUserPass(user._id, newPassword);
    res.send("Hasło zostało zmienione.");
  } catch (error) {
    console.log(error);
    handleError(error, res);
  }
});

module.exports = router;
