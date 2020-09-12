import express from "express";
import { changeUserPass, fetchUser } from "../services/databaseServices.js";
import {
  composeNewContact,
  createUser,
  prepareSafeUser,
} from "../services/dataPrepServices.js";
import {
  newError,
  handleError,
  checkPassword,
  generateAuthToken,
  checkEmailTaken,
  validateUserToken,
  hashPass,
} from "../services/services.js";
import * as config from "../config/index.js";
import AgileCRMManager from "agile_crm";
import { resetPassword } from "../services/mailServices.js";
const { CRM_USER, CRM_EMAIL, CRM_KEY } = config;

var router = express.Router();
var agileAPI = new AgileCRMManager(CRM_USER, CRM_KEY, CRM_EMAIL);

// LOGIN
router.post("/login", async (req, res) => {
  try {
    if (!req.body.password || !req.body.email) {
      throw newError("Niepełne dane.", 204);
    }
    const user = await fetchUser(req.body.email);
    await checkPassword(req.body.password, user.password);
    const safeUser = prepareSafeUser(user);
    var token = generateAuthToken(safeUser);
    res.header("x-auth-token", token).status(202).send(safeUser);
  } catch (error) {
    handleError(error, res);
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    await checkEmailTaken(req.body.email);
    const user = await createUser(req);
    await user.save();
    const contact = composeNewContact(user);
    agileAPI.contactAPI.add(contact, null, null);
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

export default router;
