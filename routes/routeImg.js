import express from "express";
import multer from "multer";
var router = express.Router();
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date() //Date.now().toString
        .toISOString()
        .trim()
        .replace(/[:_ -.]/g, "") +
        Math.floor(Math.random() * 5000 + 1) +
        file.mimetype.replace("/", ".")
    );
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "image/jpg") {
      return cb(null, false);
    }
    cb(null, true);
  },
  limits: { fileSize: 4000000 },
}); //max file size = 4Mb

router.post("/", upload.single("menuiImage"), (req, res) => {
  res.sendStatus(201);
});

export default router;
