import mongoose from "mongoose";

export default async ({ pass }) => {
  const connection = await mongoose.connect(
    "mongodb+srv://menui_db_user:" +
      pass +
      "@menui-database.9quwf.mongodb.net/<dbname>?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
      if (err) console.log("Unable to connect :(");
      else console.log("Connected To Database");
    }
  );
};
