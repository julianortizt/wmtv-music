import { sqlite } from "../db/sqlite.js";

export const Like = {
  async set(userId, videoId, value) {
    await sqlite.run(
      `INSERT INTO video_likes (user_id, video_id, value, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT (user_id, video_id) DO UPDATE
       SET value = excluded.value, updated_at = datetime('now')`,
      [userId, videoId, value]
    );
  },

  async getCounts(videoId) {
    const result = await sqlite.query(
      `SELECT COALESCE(SUM(value), 0) AS likes
       FROM video_likes
       WHERE video_id = ?`,
      [videoId]
    );
    return Number(result.rows[0]?.likes || 0);
  },

  async getUserValue(userId, videoId) {
    const result = await sqlite.query(
      `SELECT value FROM video_likes
       WHERE user_id = ? AND video_id = ?`,
      [userId, videoId]
    );
    return result.rows[0]?.value ?? null;
  },
};
