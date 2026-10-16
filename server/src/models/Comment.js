import { sqlite } from "../db/sqlite.js";

export const Comment = {
  async create({ videoId, userId, parentId = null, content }) {
    const result = await sqlite.query(
      `INSERT INTO comments (video_id, user_id, parent_id, content, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       RETURNING *`,
      [videoId, userId, parentId ?? null, content]
    );
    return result.rows[0];
  },

  async findByVideo(videoId, { limit = 50, offset = 0 } = {}) {
    const result = await sqlite.query(
      `SELECT c.*, u.username
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.video_id = ?
       ORDER BY c.created_at ASC
       LIMIT ? OFFSET ?`,
      [videoId, limit, offset]
    );
    return result.rows;
  },

  async delete(id, userId) {
    const result = await sqlite.query(
      `DELETE FROM comments WHERE id = ? AND user_id = ? RETURNING id`,
      [id, userId]
    );
    return result.rows[0] || null;
  },

  toPublic(comment) {
    return {
      id: comment.id,
      videoId: comment.video_id,
      userId: comment.user_id,
      username: comment.username,
      content: comment.content,
      parentId: comment.parent_id,
      createdAt: comment.created_at,
    };
  },
};
