const mongoose = require("mongoose");
const {
  dbPass,
  dbUser,
  dbHost,
  dbPort,
  dbName,
} = require("../config/index.js");

const loadMongoose = async () => {
  const connection = await mongoose.connect(
    "mongodb://" +
      dbHost +
      ":" +
      dbPort +
      "/" +
      dbName +
      "?ssl=true&replicaSet=globaldb",
    {
      auth: {
        user: dbUser,
        password: dbPass,
      },
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: false,
    },
    (err) => {
      if (err) console.log("Unable to connect :(");
      else console.log("Connected To Database");
    }
  );
};

module.exports = loadMongoose;
