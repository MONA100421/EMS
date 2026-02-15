import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8080"],
    credentials: true,
  }),
);

// Mount all routes under /api
app.use("/api", routes);

export default app;
