import "dotenv/config";
import bcrypt from "bcrypt";
import { sqlite } from "./sqlite.js";

const run = async () => {
  sqlite.connect();
  const passwordHash = await bcrypt.hash("password123", 10);
  try {
    sqlite.query(
      `INSERT INTO users (email, username, password_hash, created_at, updated_at)
       VALUES ('test@example.com', 'testuser', ?, datetime('now'), datetime('now'))
       ON CONFLICT (email) DO NOTHING`,
      [passwordHash]
    );
    console.log("Seed completed: testuser / password123");
  } catch (err) {
    console.error("Seed failed:", err.message);
  }
  process.exit(0);
};

run();
