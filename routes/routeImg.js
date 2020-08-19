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
  const token = req.headers["x-auth-token"];
  if (!token) {
    res.sendStatus(401);
    return;
  }
  const auth = Boolean(services.validateUserToken(token));
  if (!auth) {
    res.sendStatus(401);
    return;
  } else {
    await uploadBlob(req, res);
  }
});

export default router;
