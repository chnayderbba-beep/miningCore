const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config?.();

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined });
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, "..", "db", "migrations", "001_init.sql"), "utf8");
  await client.query(sql);
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required for admin initialization");
  const hash = await bcrypt.hash(password, 12);
  await client.query(
    `INSERT INTO users(full_name, username, email, password_hash, role)
     VALUES($1,$2,$3,$4,'admin')
     ON CONFLICT(email) DO UPDATE SET role='admin', password_hash=EXCLUDED.password_hash, updated_at=now()`,
    ["MineCore Administrator", "admin", email.toLowerCase(), hash]
  );
  await client.end();
  console.log("Migration and admin initialization complete.");
}
main().catch(e => { console.error(e.message); process.exit(1); });
