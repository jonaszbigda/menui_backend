import { removePrefix } from "./azureServices.js";

jest.mock("@azure/storage-blob", () => {
  return {
    StorageSharedKeyCredential: jest.fn(),
    newPipeline: jest.fn(),
    BlobServiceClient: jest.fn(),
  };
});

test("should remove TEMP_ prefix", () => {
  expect(removePrefix("TEMP_abcdef")).toBe("abcdef");
});
