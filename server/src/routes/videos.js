import { Router } from "express";
import { Video } from "../models/Video.js";
import { Comment } from "../models/Comment.js";
import { Like } from "../models/Like.js";
import { User } from "../models/User.js";
import { authenticate } from "../middleware/auth.js";
import { validateVideo } from "../validators/video.js";
import { handleUpload, upload } from "../services/uploadService.js";
import { enqueueVideoProcessing } from "../services/processVideoService.js";
import { storage } from "../config/storage.js";
import { sqlite } from "../db/sqlite.js";

const router = Router();

// Feed público
router.get("/feed", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const videos = await Video.feed({ limit, offset });
    res.json({ success: true, data: videos.map((v) => Video.toPublic(v)) });
  } catch (err) {
    next(err);
  }
});

// Búsqueda pública
router.get("/search", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const videos = await Video.search({ q: req.query.q, limit, offset });
    res.json({ success: true, data: videos.map((v) => Video.toPublic(v)) });
  } catch (err) {
    next(err);
  }
});

// Tendencias (más vistas)
router.get("/trending", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const videos = await Video.trending({ limit, offset });
    res.json({ success: true, data: videos.map((v) => Video.toPublic(v)) });
  } catch (err) {
    next(err);
  }
});

// Crear video (requiere auth)
router.post("/upload", authenticate, handleUpload, async (req, res, next) => {
  try {
    const errors = validateVideo(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }
    if (!req.videoKey) {
      return res.status(400).json({ success: false, message: "Falta el archivo de video" });
    }

    const video = await Video.create({
      userId: req.user.id,
      title: req.body.title,
      description: req.body.description || "",
      videoKey: req.videoKey,
      thumbnailKey: null,
      duration: Number(req.body.duration) || 0,
      fileSize: req.file?.size || 0,
      mimeType: req.file?.mimetype || "video/mp4",
    });

    // Poner en cola procesado (thumbnails, etc.)
    await enqueueVideoProcessing(video.id, req.videoKey);

    res.status(201).json({
      success: true,
      data: {
        id: video.id,
        title: video.title,
        status: video.status,
        createdAt: video.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Detalle de video
router.get("/:id", async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: "Video no encontrado" });
    }

    res.json({
      success: true,
      data: Video.toPublic(video),
    });
  } catch (err) {
    next(err);
  }
});

// Videos de un usuario
router.get("/user/:username", async (req, res, next) => {
  try {
    const user = await User.findByEmail(req.params.username);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const videos = await Video.findByUser(user.id, { limit, offset });
    res.json({ success: true, data: videos.map((v) => Video.toPublic(v)) });
  } catch (err) {
    next(err);
  }
});

// Eliminar video
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: "Video no encontrado" });
    }
    if (video.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }
    sqlite.query("DELETE FROM comments WHERE video_id = ?", [video.id]);
    sqlite.query("DELETE FROM video_likes WHERE video_id = ?", [video.id]);
    sqlite.query("DELETE FROM videos WHERE id = ?", [video.id]);
    res.json({ success: true, message: "Video eliminado" });
  } catch (err) {
    next(err);
  }
});

// Likes
router.post("/:id/like", authenticate, async (req, res, next) => {
  try {
    const value = req.body.value === 1 ? 1 : 0;
    await Like.set(req.user.id, req.params.id, value);
    const count = await Like.getCounts(req.params.id);
    res.json({ success: true, likes: count, userValue: value });
  } catch (err) {
    next(err);
  }
});

// Ver likes
router.get("/:id/likes", async (req, res, next) => {
  try {
    const count = await Like.getCounts(req.params.id);
    res.json({ success: true, likes: count });
  } catch (err) {
    next(err);
  }
});

// Vistas
router.post("/:id/views", async (req, res, next) => {
  try {
    await Video.incrementViews(req.params.id, 1);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export { router as videosRouter };
