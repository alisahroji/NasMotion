const pool = require("../../config/db");

/**
 * Cari user berdasarkan email
 */
const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, name, email, password, role, is_active
     FROM users
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

/**
 * Cari user berdasarkan ID (untuk /me)
 */
const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, role, is_active, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

module.exports = {
  findUserByEmail,
  findUserById,
};
