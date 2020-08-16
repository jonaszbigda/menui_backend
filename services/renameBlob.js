import azureBlob from "@azure/storage-blob";

const containerURL = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/img/`;
const container = "img";
const sharedKeyCredential = new azureBlob.StorageSharedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT_NAME,
  process.env.AZURE_STORAGE_ACCOUNT_KEY
);
const pipeline = azureBlob.newPipeline(sharedKeyCredential);
const blobServiceClient = new azureBlob.BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  pipeline
);

export default function renameBlob(blobURL) {
  const blobName = blobURL.replace(containerURL, "");
  const containerClient = blobServiceClient.getContainerClient(container);
  const tempBlob = containerClient.getBlobClient(blobName);
  const newBlob = containerClient.getBlobClient(removePrefix(blobName));

  newBlob.syncCopyFromURL(tempBlob.url);
  return newBlob.url;
}

function removePrefix(string) {
  const newString = string.replace("TEMP_", "");
  return newString;
}
