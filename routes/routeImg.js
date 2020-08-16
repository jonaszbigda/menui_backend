import express from "express";
import * as services from "../services/services.js";
// Azure
import azureBlob from "@azure/storage-blob";
import getStream from "into-stream";
import multer from "multer";

const container = "img";
const OneMB = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * OneMB, maxBuffers: 2 };

const sharedKeyCredential = new azureBlob.StorageSharedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT_NAME,
  process.env.AZURE_STORAGE_ACCOUNT_KEY
);
const pipeline = azureBlob.newPipeline(sharedKeyCredential);
const blobServiceClient = new azureBlob.BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  pipeline
);

const getBlobName = (originalName) => {
  const identifier = Math.random().toString().replace(/0\./, "");
  return `TEMP_${identifier}-${originalName}`;
};

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
  } else {
    const blobName = getBlobName(req.file.originalname);
    const stream = getStream(req.file.buffer);
    const containerClient = blobServiceClient.getContainerClient(container);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const response = {
      imgURL: `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/img/${blobName}`,
    };

    try {
      await blockBlobClient
        .uploadStream(
          stream,
          uploadOptions.bufferSize,
          uploadOptions.maxBuffers,
          { blobHTTPHeaders: { blobContentType: "image/jpeg" } }
        )
        .then(() => {
          let blob = containerClient.getBlobClient(blobName);
          setTimeout(() => {
            blob.delete();
          }, 1000 * 600);
          res.send(response);
        });
    } catch (err) {
      console.log(err);
    }
  }
});

export default router;
