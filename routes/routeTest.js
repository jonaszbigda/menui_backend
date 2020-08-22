import express from "express";
import * as services from "../services/services.js";

var router = express.Router();

router.post("/", async (req, res) => {
  await services
    .fetchUser()
    .then((response) => {
      res.send(response);
    })
    .catch((e) => {
      services.handleError(e, res);
    });
});

export default router;
