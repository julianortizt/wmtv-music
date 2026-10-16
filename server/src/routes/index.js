import { Router } from "express";
import { authRouter } from "./auth.js";
import { videosRouter } from "./videos.js";
import { commentsRouter } from "./comments.js";
import { notFoundHandler } from "../middleware/errorHandler.js";
import { existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = join(__dirname, "../uploads");

const router = Router();

router.use("/auth", authRouter);
router.use("/videos", videosRouter);
router.use("/comments", commentsRouter);

// Servir archivos de uploads estáticamente en desarrollo
router.get("/uploads/:file(*)", async (req, res, next) => {
  try {
    const file = decodeURIComponent(req.params.file);
    const filePath = join(UPLOAD_DIR, file);
    if (!existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Archivo no encontrado" });
    }
    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
});

router.use(notFoundHandler);

export { router };
