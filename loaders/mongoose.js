const mongoose = require("mongoose");
const { dbPass, dbName } = require("../config/index.js");

const loadMongoose = async () => {
  const connection = await mongoose.connect(
    `mongodb+srv://restricted_user:${dbPass}@menui-database.9quwf.mongodb.net/${dbName}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    (err) => {
      if (err) {
        console.log("Unable to connect :(");
      } else {
        console.log("DB Connected");
      }
    }
  );
};

module.exports = loadMongoose;
