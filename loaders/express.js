import bodyParser from "body-parser";
import cors from "cors";
import rateLimiter from "express-rate-limit";
import helmet from "helmet";
import routeDish from "../routes/routeDish.js";
import routeCity from "../routes/routeCity.js";
import routeRestaurant from "../routes/routeRestaurant.js";
import routeImg from "../routes/routeImg.js";

export default ({ app }) => {
  const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000, //time window
    max: 100, //requests from a single IP for a time window
  });

  app.use(bodyParser.json({ limit: "100kb" })); // limit JSON body payload size
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(helmet());
  app.use(limiter);
  app.use(cors());
  app.use("/dish", routeDish);
  app.use("/city", routeCity);
  app.use("/restaurant", routeRestaurant);
  app.use("/img", routeImg);

  return app;
};
