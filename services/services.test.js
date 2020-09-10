import { toShortDate, generateNewPassword } from "./services";

jest.mock("@azure/storage-blob", () => {
  return {
    StorageSharedKeyCredential: jest.fn(),
    newPipeline: jest.fn(),
    BlobServiceClient: jest.fn(),
  };
});

jest.mock("bcrypt", () => {
  return {
    foo: jest.fn(),
  };
});

test("should return false for no date on input", () => {
  expect(toShortDate()).toBe(false);
});

test("should generate random 10 characters long password", () => {
  let generatedPass = generateNewPassword();
  expect(generatedPass.length).toBe(10);
});
