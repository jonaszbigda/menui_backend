import express from "express";
import * as services from "../services/services.js";

var router = express.Router();

router.post("/", async (req, res) => {
  try {
    const decodedToken = services.validateUserToken(
      req.headers["x-auth-token"]
    );
    res.send(decodedToken);
  } catch (error) {
    services.handleError(error, res);
  }
});

export default router;
