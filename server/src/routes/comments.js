import { Router } from "express";
import { Comment } from "../models/Comment.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/video/:videoId", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const comments = await Comment.findByVideo(req.params.videoId, { limit, offset });
    res.json({ success: true, data: comments.map((c) => Comment.toPublic(c)) });
  } catch (err) {
    next(err);
  }
});

router.post("/video/:videoId", authenticate, async (req, res, next) => {
  try {
    if (!req.body.content || req.body.content.trim().length === 0) {
      return res.status(400).json({ success: false, message: "El contenido es requerido" });
    }
    if (req.body.content.length > 2000) {
      return res.status(400).json({ success: false, message: "Comentario demasiado largo" });
    }
    const comment = await Comment.create({
      videoId: req.params.videoId,
      userId: req.user.id,
      content: req.body.content.trim(),
    });
    res.status(201).json({ success: true, data: Comment.toPublic(comment) });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const comment = await Comment.delete(req.params.id, req.user.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comentario no encontrado o no autorizado" });
    }
    res.json({ success: true, message: "Comentario eliminado" });
  } catch (err) {
    next(err);
  }
});

export { router as commentsRouter };
