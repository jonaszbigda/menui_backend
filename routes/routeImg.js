const express = require("express");
const { validateUserToken, handleError, newError } = require("../services/services.js");
const { uploadBlob } = require("../services/oceanServices.js");
// FileStorage
const multer = require("multer");

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
  limits: { fileSize: 2000000 }
}).single("menuiImage");

// POST

router.post("/", (req, res) => {
    uploadStrategy(req, res, async (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          handleError(newError("File too big", 413), res);
        } else {
          handleError(newError("Unknown error...", 500), res);
        }
      } else {
        try {
          const token = req.headers["x-auth-token"];
          validateUserToken(token);
          await uploadBlob(req, res);
        } catch (error) {
          handleError(error, res)
        }
      }
    })
});

module.exports = router;