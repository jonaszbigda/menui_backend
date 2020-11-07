const mongoose = require("mongoose");
const {
  dbPass,
/*   dbUser,
  dbHost,
  dbPort, */
  dbName,
} = require("../config/index.js");

const loadMongoose = async () => {
  const connection = await mongoose.connect(
    `mongodb+srv://menui_db_user:${dbPass}@menui-database.9quwf.mongodb.net/${dbName}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) console.log("Unable to connect :(");
      else console.log("Connected To Database");
    }
  );
};

module.exports = loadMongoose;


// AZURE
/* "mongodb://" +
      dbHost +
      ":" +
      dbPort +
      "/" +
      dbName +
      "?ssl=true&replicaSet=globaldb", */