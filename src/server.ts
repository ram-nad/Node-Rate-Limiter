import express from "express";
import redis from "redis";
import { RateLimit } from "./index";

const app = express();

app.set("case sensitive routing", true);
app.set("strict routing", false);
app.set("x-powered-by", false);

let redisClient;
const REDIS_URL = process.env.REDIS_URL;
if (REDIS_URL) {
  redisClient = redis.createClient(REDIS_URL);
}

const INTERVAL = Number.parseInt(process.env.INTERVAL || "3600000");
const LIMIT = Number.parseInt(process.env.LIMIT || "100");
const DELAY = Number.parseInt(process.env.DELAY || "0");

const rateLimiter = RateLimit({
  redis: redisClient,
  interval: INTERVAL,
  limit: LIMIT,
  delay: DELAY,
});

app.post("/check/:id", (req, res, next) => {
  const id: string = req.params.id;

  rateLimiter
    .check(id)
    .then((data) => {
      res.status(200).json(data);
      console.log(req.ip, req.originalUrl, data);
    })
    .catch((err) => next(err));
});

app.post("/delete/:id", (req, res, next) => {
  const id: string = req.params.id;

  rateLimiter
    .delete(id)
    .then((data) => {
      const resp = { deleted: data };
      res.status(200).json(resp);
      console.log(req.ip, req.originalUrl, resp);
    })
    .catch((err) => next(err));
});

app.use((req, res, next) => {
  res.status(400).json({ message: "Bad Request" });
  console.error(req.ip, req.originalUrl, "Invalid Route");
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(req.ip, req.originalUrl, err);
  }
);

const PORT = Number.parseInt(process.env.PORT || "3000");
app.listen(PORT, () => {
  console.log(`Server running at PORT: ${PORT}`);
});
