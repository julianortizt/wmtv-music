import { spawn } from "child_process";
import { mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { videoQueue } from "./queueService.js";
import { Video } from "../models/Video.js";
import { sqlite } from "../db/sqlite.js";
import { UPLOAD_DIR } from "../config/storage.js";

const run = (cmd, args) =>
  new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", reject);
    proc.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${cmd} salió con código ${code}: ${stderr.slice(-400)}`))
    );
  });

const runCapture = (cmd, args) =>
  new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", reject);
    proc.on("close", (code) =>
      code === 0
        ? resolve(stdout)
        : reject(new Error(`${cmd} salió con código ${code}: ${stderr.slice(-400)}`))
    );
  });

export const enqueueVideoProcessing = async (videoId, videoKey) => {
  try {
    await videoQueue.add(
      "process-video",
      { videoId, videoKey },
      {
        jobId: `video-${videoId}`,
        removeOnComplete: true,
        removeOnFail: 10,
      }
    );
  } catch (err) {
    // Sin Redis u otro error de cola: procesamos en línea para no perder el video
    console.warn(`Cola no disponible (${err.message}), procesando inline el video ${videoId}`);
    await processVideoJob({ data: { videoId, videoKey } });
  }
};

export const processVideoJob = async (job) => {
  const { videoId, videoKey } = job.data;
  console.log(`Procesando video ${videoId} (${videoKey})...`);

  const inputPath = join(UPLOAD_DIR, videoKey);
  let duration = 0;
  let thumbnailKey = null;

  // 1) Duración con ffprobe
  try {
    const out = await runCapture("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      inputPath,
    ]);
    duration = Math.round(parseFloat(out)) || 0;
  } catch (err) {
    console.warn(`ffprobe falló para video ${videoId}:`, err.message);
  }

  // 2) Thumbnail en el segundo 1 (o en el 0 si el video es más corto)
  try {
    const thumbDir = join(UPLOAD_DIR, "thumbnails");
    await mkdir(thumbDir, { recursive: true });
    const thumbName = `thumb-${videoId}-${randomUUID()}.jpg`;
    const thumbPath = join(thumbDir, thumbName);
    try {
      await run("ffmpeg", [
        "-y", "-ss", "00:00:01", "-i", inputPath,
        "-frames:v", "1", "-vf", "scale=640:-2", "-q:v", "3", thumbPath,
      ]);
    } catch (_) {
      await run("ffmpeg", [
        "-y", "-i", inputPath,
        "-frames:v", "1", "-vf", "scale=640:-2", "-q:v", "3", thumbPath,
      ]);
    }
    thumbnailKey = `thumbnails/${thumbName}`;
  } catch (err) {
    console.warn(`No se pudo generar thumbnail del video ${videoId}:`, err.message);
  }

  // 3) Guardar resultados en BD
  if (duration > 0) {
    await sqlite.query("UPDATE videos SET duration = ? WHERE id = ?", [duration, videoId]);
  }
  if (thumbnailKey) {
    await sqlite.query("UPDATE videos SET thumbnail_key = ? WHERE id = ?", [thumbnailKey, videoId]);
  }

  // 4) Publicar (aunque falle el thumbnail, el video no debe quedarse en processing)
  await Video.updateStatus(videoId, "published");
  console.log(`Video ${videoId} publicado (duración=${duration}s, thumbnail=${thumbnailKey || "ninguno"})`);
};
