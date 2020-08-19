import { removePrefix } from "./azureServices.js";
import { JsonWebTokenError } from "jsonwebtoken";
import azureBlob from "@azure/storage-blob";
jest.mock("@azure/storage-blob");

test("should remove TEMP_ prefix", () => {
  expect(removePrefix("TEMP_abcdef")).toBe("abcdef");
});
