const expressLoader = require("./express.js");
const mongooseLoader = require("./mongoose.js");

const loaders = async ({ expressApp }) => {
  await mongooseLoader();
  console.log("DB Connection Successful");
  await expressLoader({ app: expressApp });
  console.log("Express Initialized");
};

module.exports = loaders;
