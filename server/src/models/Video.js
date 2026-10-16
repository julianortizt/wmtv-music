import { sqlite } from "../db/sqlite.js";
import { storage } from "../config/storage.js";

export const Video = {
  async create({
    userId,
    title,
    description = "",
    videoKey,
    thumbnailKey,
    duration = 0,
    fileSize = 0,
    mimeType = "video/mp4",
  }) {
    const result = await sqlite.query(
      `INSERT INTO videos (user_id, title, description, video_key, thumbnail_key, duration, file_size, mime_type, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'processing', datetime('now'))
       RETURNING *`,
      [userId, title, description, videoKey, thumbnailKey ?? null, duration, fileSize, mimeType]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await sqlite.query(
      `SELECT v.*, u.username AS uploader_username
       FROM videos v
       JOIN users u ON u.id = v.user_id
       WHERE v.id = ?`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByUser(userId, { limit = 20, offset = 0 } = {}) {
    const result = await sqlite.query(
      `SELECT v.*, u.username AS uploader_username
       FROM videos v
       JOIN users u ON u.id = v.user_id
       WHERE v.user_id = ?
       ORDER BY v.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return result.rows;
  },

  async feed({ limit = 20, offset = 0 } = {}) {
    const result = await sqlite.query(
      `SELECT v.*, u.username AS uploader_username
       FROM videos v
       JOIN users u ON u.id = v.user_id
       WHERE v.status = 'published'
       ORDER BY v.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return result.rows;
  },

  async trending({ limit = 20, offset = 0 } = {}) {
    const result = await sqlite.query(
      `SELECT v.*, u.username AS uploader_username
       FROM videos v
       JOIN users u ON u.id = v.user_id
       WHERE v.status = 'published'
       ORDER BY v.views DESC, v.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return result.rows;
  },

  async search({ q, limit = 20, offset = 0 } = {}) {
    if (!q || q.trim().length === 0) {
      return this.feed({ limit, offset });
    }
    const search = `%${q.trim()}%`;
    const result = await sqlite.query(
      `SELECT v.*, u.username AS uploader_username
       FROM videos v
       JOIN users u ON u.id = v.user_id
       WHERE v.status = 'published'
         AND (v.title LIKE ? OR v.description LIKE ?)
       ORDER BY v.created_at DESC
       LIMIT ? OFFSET ?`,
      [search, search, limit, offset]
    );
    return result.rows;
  },

  async updateStatus(id, status) {
    const result = await sqlite.query(
      `UPDATE videos SET status = ?, updated_at = datetime('now')
       WHERE id = ?
       RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  },

  async incrementViews(id, increment = 1) {
    await sqlite.run(
      `UPDATE videos SET views = COALESCE(views, 0) + ?, updated_at = datetime('now')
       WHERE id = ?`,
      [increment, id]
    );
  },

  toPublic(video, signedUrl = null, thumbnailSignedUrl = null) {
    const videoUrl = signedUrl ?? storage.getPublicUrl(video.video_key);
    const thumbnailUrl =
      thumbnailSignedUrl ??
      (video.thumbnail_key ? storage.getPublicUrl(video.thumbnail_key) : null);
    return {
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl,
      thumbnailUrl,
      duration: video.duration,
      fileSize: video.file_size,
      mimeType: video.mime_type,
      status: video.status,
      views: video.views || 0,
      uploader: {
        id: video.user_id,
        username: video.uploader_username,
      },
      createdAt: video.created_at,
      updatedAt: video.updated_at,
    };
  },
};
