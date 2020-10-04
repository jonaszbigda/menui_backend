import express from "express";
import { handleError } from "../services/services.js";

var router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("test");
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
