import { removePrefix } from "./azureServices.js";
import azureBlob from "@azure/storage-blob";

jest.mock("@azure/storage-blob", () => {
  return jest.fn().mockImplementation(() => {
    return { StorageSharedKeyCredential: jest.fn() };
  });
});

test("should remove TEMP_ prefix", () => {
  expect(removePrefix("TEMP_abcdef")).toBe("abcdef");
});
