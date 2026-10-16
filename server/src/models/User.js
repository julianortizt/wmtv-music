import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sqlite } from "../db/sqlite.js";

const SALT_ROUNDS = 10;

export const User = {
  async create({ email, username, password }) {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await sqlite.query(
      `INSERT INTO users (email, username, password_hash, created_at)
       VALUES (?, ?, ?, datetime('now'))
       RETURNING id, email, username, created_at`,
      [email.toLowerCase(), username, hashed]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await sqlite.query(
      `SELECT id, email, username, password_hash, created_at, updated_at
       FROM users WHERE email = ?`,
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await sqlite.query(
      `SELECT id, email, username, created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );
    return result.rows[0] || null;
  },

  async validatePassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  },

  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "change-me",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
  },

  toPublic(user) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  },
};
