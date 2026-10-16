import { randomUUID } from "crypto";
import "dotenv/config";
import { mkdir } from "fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = process.env.UPLOAD_DIR || `${__dirname}/../uploads`;

export const storage = {
  async ensureBucket() {
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (_) {}
  },

  async uploadFile(fileBuffer, filename, contentType, folder = "videos") {
    await this.ensureBucket();
    const safeFolder = folder.replace(/\/+/g, "-");
    const dir = `${UPLOAD_DIR}/${safeFolder}`;
    await mkdir(dir, { recursive: true });
    const key = `${safeFolder}/${randomUUID()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const fullPath = `${UPLOAD_DIR}/${key}`;
    await import("fs/promises").then((m) => m.writeFile(fullPath, fileBuffer));
    return key;
  },

  getPublicUrl(key) {
    // La ruta real del backend es /api/uploads/:file (montada bajo /api)
    return `/api/uploads/${encodeURIComponent(key)}`;
  },

  async getSignedUrl(key, _expires = 3600) {
    // En esta versión simple devolvemos la ruta pública; firmar URLs requiere S3 real.
    return this.getPublicUrl(key);
  },
};
