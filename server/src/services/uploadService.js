import multer from "multer";
import { storage } from "../config/storage.js";

const MAX_VIDEO_SIZE_MB = Number(process.env.MAX_VIDEO_SIZE_MB) || 500;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/x-msvideo",
  "video/quicktime",
];

const storageConfig = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return cb(new Error(`El archivo excede el límite de ${MAX_VIDEO_SIZE_MB} MB`), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage: storageConfig,
  fileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE_BYTES },
}).single("video");

export const handleUpload = async (req, res, next) => {
  return new Promise((resolve, reject) => {
    upload(req, res, async (err) => {
      if (err) {
        let message = err.message;
        if (err instanceof multer.MulterError) {
          message = err.message;
        }
        return reject({ status: 400, message });
      }
      if (!req.file) {
        return reject({ status: 400, message: "No se proporcionó archivo" });
      }
      try {
        const filename = req.file.originalname || "video.mp4";
        const videoKey = await storage.uploadFile(
          req.file.buffer,
          filename,
          req.file.mimetype,
          "videos"
        );
        resolve(videoKey);
      } catch (err) {
        reject({ status: 500, message: "Error al guardar el video" });
      }
    });
  }).then((videoKey) => {
    req.videoKey = videoKey;
    next();
  }).catch((err) => {
    next(err);
  });
};
