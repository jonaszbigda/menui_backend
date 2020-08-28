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
const { CRM_USER, CRM_EMAIL, CRM_KEY } = config;

var router = express.Router();
var agileAPI = new AgileCRMManager(CRM_USER, CRM_KEY, CRM_EMAIL);

// LOGIN
router.post("/login", async (req, res) => {
  try {
    if (!req.body.password || !req.body.email) {
      throw newError("No input data", 204);
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
      throw newError("No input data", 204);
    }
    const token = req.headers["x-auth-token"];
    validateUserToken(token);
    const user = await fetchUser(req.body.email);
    await checkPassword(req.body.password, user.password);
    const newPassword = await hashPass(req.body.newPass);
    await changeUserPass(user._id, newPassword);
    res.status(200).send("Password changed");
  } catch (error) {
    handleError(error, res);
  }
});

// RESET PASSWORD
router.post("/resetpassword", (req, res) => {
  try {
    //
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
