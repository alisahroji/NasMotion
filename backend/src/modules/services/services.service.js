const pool = require("../../config/db");

const getAllServices = async ({ search, is_active }) => {
  let query = `
    SELECT id, name, description, price, duration_est, is_active, created_at, updated_at
    FROM service_catalog
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
  }

  if (is_active !== undefined) {
    params.push(is_active);
    query += ` AND is_active = $${params.length}`;
  }

  query += ` ORDER BY name ASC`;
  const result = await pool.query(query, params);
  return result.rows;
};

const getServiceById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, description, price, duration_est, is_active, created_at, updated_at
     FROM service_catalog WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const createService = async ({ name, description, price, duration_est }) => {
  const result = await pool.query(
    `INSERT INTO service_catalog (name, description, price, duration_est)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, description, price, duration_est]
  );
  return result.rows[0];
};

const updateService = async (id, { name, description, price, duration_est }) => {
  const result = await pool.query(
    `UPDATE service_catalog
     SET name=$1, description=$2, price=$3, duration_est=$4, updated_at=NOW()
     WHERE id=$5
     RETURNING *`,
    [name, description, price, duration_est, id]
  );
  return result.rows[0] || null;
};

const toggleServiceStatus = async (id) => {
  const result = await pool.query(
    `UPDATE service_catalog
     SET is_active = NOT is_active, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};

const deleteService = async (id) => {
  const result = await pool.query(
    `DELETE FROM service_catalog WHERE id=$1 RETURNING id`,
    [id]
  );
  return result.rows[0] || null;
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  toggleServiceStatus,
  deleteService,
};