import express from "express";
import * as services from "../services/services.js";
import * as config from "../config/index.js";
import AgileCRMManager from "agile_crm";
const { CRM_USER, CRM_EMAIL, CRM_KEY } = config;

var router = express.Router();
var agileAPI = new AgileCRMManager(CRM_USER, CRM_KEY, CRM_EMAIL);

// LOGIN
router.post("/login", async (req, res) => {
  try {
    if (!req.body.password || !req.body.email) {
      throw services.newError("No input data", 204);
    }
    const user = await services.fetchUser(req.body.email);
    await services.checkPassword(req.body.password, user.password);
    const safeUser = services.prepareSafeUser(user);
    var token = services.generateAuthToken(safeUser);
    res.header("x-auth-token", token).status(202).send(safeUser);
  } catch (error) {
    services.handleError(error, res);
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    await services.checkEmailTaken(req.body.email);
    const user = await services.createUser(req);
    await user.save();
    const contact = services.composeNewContact(user);
    agileAPI.contactAPI.add(contact, null, null);
    res.sendStatus(201);
  } catch (e) {
    services.handleError(e, res);
  }
});

export default router;
