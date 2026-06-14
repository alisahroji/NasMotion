const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // wajib untuk Supabase
  },
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL connected via Supabase");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL error:", err.message);
  process.exit(1);
});

module.exports = pool;