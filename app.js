const config = require("./config/index.js");
const { port, dbPass, cookiesSecret } = config;
const express = require("express");
const app = express();
const loaders = require("./loaders/index.js");
//
// Server init function
//
async function startServer() {
  await loaders({
    expressApp: app,
  });
  app.listen(port, (err) => {
    if (err) {
      console.log("Server Startup Failed");
      return;
    }
    console.log(` Server is listening at: ${port} `);
  });
}

startServer();
