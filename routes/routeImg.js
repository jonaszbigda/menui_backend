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

router.post("/", async (req, res) => {
  try {
    await uploadStrategy(req, res, async (err) => {
      if(err){
        if(err.code === "LIMIT_FILE_SIZE"){
          throw newError("error", 413);
        }
      } else {
        const token = req.headers["x-auth-token"];
        validateUserToken(token);
        await uploadBlob(req, res);
      }
    })
  } catch (error) {
    console.log("error:   " + error)
    handleError(error, res);
  }
});

module.exports = router;
