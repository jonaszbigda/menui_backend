import azureBlob from "@azure/storage-blob";
import getStream from "into-stream";

// SETUP
const containerURL = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/img/`;
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

// CODE
export function renameBlob(blobURL) {
  const blobName = blobURL.replace(containerURL, "");
  const containerClient = blobServiceClient.getContainerClient(container);
  const tempBlob = containerClient.getBlobClient(blobName);
  const newBlob = containerClient.getBlobClient(removePrefix(blobName));

  newBlob.syncCopyFromURL(tempBlob.url);
  return newBlob.url;
}

export async function uploadBlob(request, resp) {
  const blobName = makeTempBlobName(request.file.originalname);
  const stream = getStream(request.file.buffer);
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
        setDeleteTempBlobTimer(blobName, containerClient, 1);
        resp.send(response);
      });
  } catch (err) {
    console.log(err);
  }
}

export function removePrefix(string) {
  const newString = string.replace("TEMP_", "");
  return newString;
}

export function makeTempBlobName(originalName) {
  const identifier = Math.random().toString().replace(/0\./, "");
  return `TEMP_${identifier}-${originalName}`;
}

export function setDeleteTempBlobTimer(blobName, containerClient, minutes) {
  let blob = containerClient.getBlobClient(blobName);
  setTimeout(() => {
    blob.delete();
  }, 1000 * 60 * minutes);
}
