import mongoose from "mongoose";
import { dbPass, dbUser, dbHost, dbPort, dbName } from "../config/index.js";

export default async () => {
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
