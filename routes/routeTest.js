import express from "express";
import * as services from "../services/services.js";
import * as databaseServices from "../services/databaseServices.js";

var router = express.Router();

router.post("/", async (req, res) => {
  try {
    const newDate = await databaseServices.renewSubscription(
      req.body.restaurantId,
      1
    );
    res.send(`Subskrypcja przedłużona do: ${newDate}`);
  } catch (error) {
    services.handleError(error, res);
  }
});

export default router;
