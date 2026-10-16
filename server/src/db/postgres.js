import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

export const db = {
  pool: new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "youtube_clone",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }),

  async connect() {
    const client = await this.pool.connect();
    try {
      await client.query("SELECT 1");
      console.log("PostgreSQL connected");
    } finally {
      client.release();
    }
  },

  query(sql, params = []) {
    return this.pool.query(sql, params);
  },

  async transactional(fn) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};
