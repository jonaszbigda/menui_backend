import expressLoader from "./express.js";
import mongooseLoader from "./mongoose.js";

export default async ({ expressApp, dbPass, secret }) => {
  const mongoConnection = await mongooseLoader({ pass: dbPass });
  console.log("Mongoose Loaded");
  await expressLoader({ app: expressApp, secret: secret });
  console.log("Express Initialized");
};
