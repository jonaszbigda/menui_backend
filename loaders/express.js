import bodyParser from "body-parser";
import cors from "cors";
import rateLimiter from "express-rate-limit";
import helmet from "helmet";
import routeDish from "../routes/routeDish.js";
import routeRestaurant from "../routes/routeRestaurant.js";
import routeUser from "../routes/routeUser.js";
import routeSearch from "../routes/routeSearch.js";
import routeImg from "../routes/routeImg.js";
import routePayments from "../routes/routePayments.js";

export default ({ app, secret }) => {
  const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000, //time window
    max: 100, //requests from a single IP for a time window
  });

  app.use(cors({ exposedHeaders: "x-auth-token" }));
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
  app.use("/payments", routePayments);

  return app;
};
