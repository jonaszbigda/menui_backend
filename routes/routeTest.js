import express from "express";

var router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("test");
  } catch (error) {
    services.handleError(error, res);
  }
});

export default router;
