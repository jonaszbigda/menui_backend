const expressLoader = require("./express.js");
const mongooseLoader = require("./mongoose.js");

const loaders = async ({ expressApp, secret }) => {
  const mongoConnection = await mongooseLoader();
  console.log("Mongoose Loaded");
  await expressLoader({ app: expressApp, secret: secret });
  console.log("Express Initialized");
};

module.exports = loaders;
