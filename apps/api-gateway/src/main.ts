import express from "express"; // express framework
import cors from "cors"; // CORS middleware
import proxy from "express-http-proxy"; // reverse proxy middleware
import morgan from "morgan"; // logging middleware
import rateLimit, { ipKeyGenerator } from "express-rate-limit"; // rate limiter
import cookieParser from "cookie-parser"; // cookie parsing

const app = express(); // create app instance

// CORS: allow front-end origin, specific headers, and cookies
app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(morgan("dev")); // log incoming requests (dev-friendly)
app.use(express.json({ limit: "100mb" })); // parse JSON bodies, limit size
app.use(express.urlencoded({ limit: "100mb", extended: true })); // parse urlencoded bodies
app.use(cookieParser()); // parse cookies into req.cookies

app.set("trust proxy", 1); // trust first proxy for req.ip and secure cookies

// rate limiter config
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: any) => (req.user ? 1000 : 100), // higher quota if authenticated
  message: { error: "Too many requests, please try again later!" },
  standardHeaders: true, // include RateLimit-* headers
  legacyHeaders: true, // include X-RateLimit-* headers
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown", 56), // group by IP/subnet
});
app.use(limiter); // apply globally

// health check route
app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

// proxy other requests to internal service
app.use("/", proxy("http://localhost:6001"));

// start server
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
