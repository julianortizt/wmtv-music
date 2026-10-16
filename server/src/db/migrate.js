import "dotenv/config";
import { sqlite } from "./sqlite.js";
import { mkdir } from "fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = `${__dirname}/../data`;
const DB_PATH = process.env.SQLITE_PATH || `${DB_DIR}/app.db`;

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    video_key TEXT NOT NULL,
    thumbnail_key TEXT,
    duration INTEGER DEFAULT 0,
    file_size INTEGER DEFAULT 0,
    mime_type TEXT DEFAULT 'video/mp4',
    status TEXT DEFAULT 'processing',
    views INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS video_likes (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    value INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, video_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_videos_user ON videos(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status)`,
  `CREATE INDEX IF NOT EXISTS idx_comments_video ON comments(video_id)`,
];

const run = async () => {
  try {
    await mkdir(DB_DIR, { recursive: true });
  } catch (_) {}
  await sqlite.connect();
  for (const sql of MIGRATIONS) {
    try {
      await sqlite.query(sql);
      console.log("Migration executed:", sql.slice(0, 60));
    } catch (err) {
      console.warn("Migration skipped:", err.message);
    }
  }
  console.log("Migrations completed");
  await sqlite.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
