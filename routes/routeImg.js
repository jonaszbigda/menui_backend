import express from "express";
import multer from "multer";
import fs from "fs";
import * as services from "../services/services.js";

var router = express.Router();
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now()
        .toString()
        .trim()
        .replace(/[:_ -.]/g, "") +
        Math.floor(Math.random() * 5000 + 1) +
        file.mimetype.replace("/", ".") +
        "_TEMP"
    );
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg") {
      return cb(null, false);
    }
    cb(null, true);
  },
  limits: { fileSize: 4000000 },
}); //max file size = 4Mb

// POST

router.post("/", upload.single("menuiImage"), async (req, res) => {
  const token = req.headers["x-auth-token"];
  if (!token) {
    res.sendStatus(401);
    return;
  }
  services.validateUserToken(token, (result) => {
    if (!result) {
      res.sendStatus(401);
    } else {
      try {
        const image = req.file;
        if (!image) {
          res.sendStatus(204);
        } else {
          setTimeout(() => {
            fs.unlink(image.path, (err) => {
              if (err) {
                console.log("No such file or directory");
              }
            });
          }, 1000 * 600);
          res
            .status(200)
            .cookie("img", encodeURI(image.path), {
              maxAge: 1000 * 600,
            })
            .send();
        }
      } catch (err) {
        res.sendStatus(500);
      }
    }
  });
});

export default router;
