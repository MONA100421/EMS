import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import apiRouter from "./routes";

dotenv.config();

const PORT = process.env.PORT || 4000;
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND,
    credentials: true,
  }),
);

// Routes
app.use("/api", apiRouter);

// Health check
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Backend running" });
});

// Mongo connect + start server
async function start() {
  const mongoUri = process.env.MONGODB_URI as string;

  if (!mongoUri) {
    console.error("❌ MONGODB_URI missing");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("✅ Mongo connected");

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
