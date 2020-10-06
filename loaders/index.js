import expressLoader from "./express.js";
import mongooseLoader from "./mongoose.js";

export default async ({ expressApp, secret }) => {
  const mongoConnection = await mongooseLoader();
  console.log("Mongoose Loaded");
  await expressLoader({ app: expressApp, secret: secret });
  console.log("Express Initialized");
};
