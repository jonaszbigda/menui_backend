import * as config from "./config/index.js";
const { port, dbPass, cookiesSecret } = config;
import express from "express";
const app = express();
import loaders from "./loaders/index.js";
//
// Server init function
//
async function startServer() {
  await loaders({
    expressApp: app,
    dbPass: dbPass,
    secret: cookiesSecret,
  });
  app.listen(port, (err) => {
    if (err) {
      console.log("Server Startup Failed");
      return;
    }
    console.log("Server is running");
  });
}

startServer();
