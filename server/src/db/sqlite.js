import sqlite3 from "sqlite3";
import { promisify } from "util";
import "dotenv/config";
import { mkdir } from "fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.SQLITE_PATH || `${__dirname}/../data/app.db`;

const DB_DIR = `${__dirname}/../data`;

let db;
let connected = false;

export const sqlite = {
  get isConnected() {
    return connected;
  },

  async connect() {
    if (connected) return;
    await mkdir(DB_DIR, { recursive: true });
    return new Promise((resolve, reject) => {
      db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) return reject(err);
        db.run("PRAGMA journal_mode = WAL");
        db.run("PRAGMA foreign_keys = ON");
        console.log("SQLite connected at", DB_PATH);
        connected = true;
        resolve();
      });
    });
  },

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve({ rows });
      });
    });
  },

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ changes: this.changes, lastID: this.lastID });
      });
    });
  },

  async exec(sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  },

  async close() {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) return reject(err);
        connected = false;
        resolve();
      });
    });
  },

  async transactional(fn) {
    try {
      await this.run("BEGIN");
      const result = await fn(this);
      await this.run("COMMIT");
      return result;
    } catch (err) {
      await this.run("ROLLBACK");
      throw err;
    }
  },
};
