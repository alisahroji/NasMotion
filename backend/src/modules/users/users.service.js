const pool = require("../../config/db");

/**
 * Ambil semua user (exclude password)
 */
const getAllUsers = async ({ role, is_active }) => {
  let query = `
    SELECT id, name, email, role, is_active, created_at, updated_at
    FROM users
    WHERE 1=1
  `;
  const params = [];

  if (role) {
    params.push(role);
    query += ` AND role = $${params.length}`;
  }

  if (is_active !== undefined) {
    params.push(is_active);
    query += ` AND is_active = $${params.length}`;
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Ambil user by ID
 */
const getUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, role, is_active, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Cek email sudah ada
 */
const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
};

/**
 * Buat user baru
 */
const createUser = async ({ name, email, password, role }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, is_active, created_at`,
    [name, email, password, role]
  );
  return result.rows[0];
};

/**
 * Update user
 */
const updateUser = async (id, { name, email, role }) => {
  const result = await pool.query(
    `UPDATE users
     SET name = $1, email = $2, role = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING id, name, email, role, is_active, updated_at`,
    [name, email, role, id]
  );
  return result.rows[0] || null;
};

/**
 * Update password user
 */
const updateUserPassword = async (id, hashedPassword) => {
  await pool.query(
    `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
    [hashedPassword, id]
  );
};

/**
 * Toggle status aktif/nonaktif
 */
const toggleUserStatus = async (id) => {
  const result = await pool.query(
    `UPDATE users
     SET is_active = NOT is_active, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, role, is_active`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Hapus user permanen
 */
const deleteUser = async (id) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0] || null;
};

module.exports = {
  getAllUsers,
  getUserById,
  findUserByEmail,
  createUser,
  updateUser,
  updateUserPassword,
  toggleUserStatus,
  deleteUser,
};
