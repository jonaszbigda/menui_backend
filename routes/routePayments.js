const express = require("express");
const { handleError } = require("../services/services.js");

var router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("test");
  } catch (error) {
    handleError(error, res);
  }
});

module.exports = router;
