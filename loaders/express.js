const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const routeDish = require("../routes/routeDish.js");
const routeRestaurant = require("../routes/routeRestaurant.js");
const routeUser = require("../routes/routeUser.js");
const routeSearch = require("../routes/routeSearch.js");
const routeImg = require("../routes/routeImg.js");
const routeHealth = require("../routes/routeHealth.js");
const routeAdmin = require("../routes/routeAdmin.js")

const loadExpress = ({ app, secret }) => {
  const limiter = rateLimiter({
    windowMs: 10 * 60 * 1000, //time window
    max: 100, //requests = a single IP for a time window
  });

  app.use(cors({ exposedHeaders: "x-auth-token", origin: true, credentials: true }));
  app.use(helmet());
  app.use(limiter);
  app.use(bodyParser.json({ limit: "100kb" })); // limit JSON body payload size
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(function (err, req, res, next) {
    if (err) res.sendStatus(422);
  });
  app.use("/dish", routeDish);
  app.use("/restaurant", routeRestaurant);
  app.use("/img", routeImg);
  app.use("/user", routeUser);
  app.use("/search", routeSearch);
  app.use("/healthcheck", routeHealth);
  app.use("/00xc232", routeAdmin)

  return app;
};

module.exports = loadExpress;
