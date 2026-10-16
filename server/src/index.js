import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { router } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sqlite } from "./db/sqlite.js";
import { redis } from "./db/redis.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Healthcheck
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", router);

app.use(errorHandler);

const start = async () => {
  try {
    await sqlite.connect();

    // Worker de procesamiento de videos (FFmpeg) en el mismo proceso.
    // Desactivable con WORKER_ENABLED=false para correrlo aparte (npm run queues).
    if (process.env.WORKER_ENABLED !== "false") {
      await import("./queues/worker.js");
    }

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
