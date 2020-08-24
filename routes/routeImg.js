import express from "express";
import * as services from "../services/services.js";
import { uploadBlob } from "../services/azureServices.js";
// Azure
import multer from "multer";

var router = express.Router();
var storage = multer.memoryStorage();
const uploadStrategy = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg") {
      return cb(null, false);
    }
    cb(null, true);
  },
  limits: { fileSize: 4000000 },
}).single("image");

// POST

router.post("/", uploadStrategy, async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    services.validateUserToken(token);
    await uploadBlob(req, res);
  } catch (error) {
    services.handleError(error, res);
  }
});

export default router;
