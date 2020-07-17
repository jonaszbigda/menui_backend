import expressLoader from "./express.js";
import mongooseLoader from "./mongoose.js";

export default async ({ expressApp, dbPass }) => {
  const mongoConnection = await mongooseLoader({ pass: dbPass });
  console.log("Mongoose Loaded");
  await expressLoader({ app: expressApp });
  console.log("Express Initialized");
};
