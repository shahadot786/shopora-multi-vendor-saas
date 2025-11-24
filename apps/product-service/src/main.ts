import { errorMiddleware } from "@packages/error-handler/error-middleware";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/product.routes";
// import swaggerUi from "swagger-ui-express";
// import swaggerDocument = require("./swagger-output.json");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello Product API" });
});

//swagger documentation
// app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.get("/docs-json", (req, res) => {
//   res.json(swaggerDocument);
// });

//routes
app.use("/api", router);

app.use(errorMiddleware);

const port = process.env.PORT || 6002;
const server = app.listen(port, () => {
  console.log(`Product service is running at http://localhost:${port}/api`);
  console.log(`Swagger is available at https://localhost:${port}/docs`);
});

server.on("error", (err) => {
  console.log("Server error:", err);
});
