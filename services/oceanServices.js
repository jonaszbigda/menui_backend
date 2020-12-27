const getStream = require("into-stream");
const { s3_key, s3_secret } = require('../config/index.js');
const aws = require('aws-sdk');
const spacesEndpoint = new aws.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: s3_key,
    secretAccessKey: s3_secret
});
const { newError } = require("./services.js");

// SETUP

// CODE
async function renameBlob(blobURL) {
    try {
        const containerURL = "https://menuicdn.fra1.digitaloceanspaces.com/";
        const key = blobURL.replace(containerURL, "");
        s3.copyObject({
            CopySource: "menuicdn/" + key,
          Bucket: "menuicdn",
            ACL: 'public-read',
            Key: removePrefix(key)
        }, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    deleteImage(blobURL)
                }
        });
        const newUrl = containerURL + removePrefix(key);
        return newUrl;
  } catch (e) {
    throw newError("Unable to save image", 500);
  }
}

async function uploadBlob(request, resp) {
  const blobName = makeTempBlobName(request.file.originalname);
  const stream = getStream(request.file.buffer);
  const response = {
    imgURL: `https://menuicdn.fra1.digitaloceanspaces.com/${blobName}`,
    };

  try {
      s3.upload({
          Bucket: 'menuicdn',
          Body: stream,
          Key: blobName,
          ACL: 'public-read',
          ContentType: request.file.mimetype
      }, (err, data) => {{
        setDeleteTempBlobTimer(blobName, 15);
        resp.send(response);
              }
    });
  } catch (err) {
    throw newError("Unable to save image", 500);
  }
}

function removePrefix(string) {
  const newString = string.replace("TEMP_", "");
  return newString;
}

function makeTempBlobName(originalName) {
  const trimmedName = originalName.replace(/\s/g, '');
  const identifier = Math.random().toString().replace(/0\./, "");
  return `TEMP_${identifier}-${trimmedName}`;
}

function setDeleteTempBlobTimer(blobName, minutes) {
  setTimeout(() => {
      s3.deleteObject({
          Key: blobName,
          Bucket: "menuicdn"
      }, (err) => {
              console.log(err)
      });
  }, 1000 * 60 * minutes);
}

async function deleteImage(url) {
  if (!url || url === "" || url === "empty") {
    return;
  } else {
    try {
      const containerUrl = "https://menuicdn.fra1.digitaloceanspaces.com/";
      const key = url.replace(containerUrl, "");
        s3.deleteObject({
            Key: key,
            Bucket: "menuicdn"
        }, (err) => {
                console.log(err)
      })
    } catch (error) {
      console.log(error);
    }
  }
}

exports.renameBlob = renameBlob;
exports.uploadBlob = uploadBlob;
exports.removePrefix = removePrefix;
exports.makeTempBlobName = makeTempBlobName;
exports.setDeleteTempBlobTimer = setDeleteTempBlobTimer;
exports.deleteImage = deleteImage;
