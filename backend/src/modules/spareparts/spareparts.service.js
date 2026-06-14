const pool = require("../../config/db");

const getAllSpareparts = async ({ search, is_active, low_stock }) => {
  let query = `
    SELECT id, name, code, brand, unit, price, stock, min_stock, is_active, created_at, updated_at
    FROM spareparts
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (name ILIKE $${params.length} OR code ILIKE $${params.length} OR brand ILIKE $${params.length})`;
  }

  if (is_active !== undefined) {
    params.push(is_active);
    query += ` AND is_active = $${params.length}`;
  }

  if (low_stock === "true") {
    query += ` AND stock <= min_stock`;
  }

  query += ` ORDER BY name ASC`;
  const result = await pool.query(query, params);
  return result.rows;
};

const getSparepartById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, code, brand, unit, price, stock, min_stock, is_active, created_at, updated_at
     FROM spareparts WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const createSparepart = async ({ name, code, brand, unit, price, stock, min_stock }) => {
  const result = await pool.query(
    `INSERT INTO spareparts (name, code, brand, unit, price, stock, min_stock)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, code, brand, unit, price, stock, min_stock]
  );
  return result.rows[0];
};

const updateSparepart = async (id, { name, code, brand, unit, price, min_stock }) => {
  const result = await pool.query(
    `UPDATE spareparts
     SET name=$1, code=$2, brand=$3, unit=$4, price=$5, min_stock=$6, updated_at=NOW()
     WHERE id=$7
     RETURNING *`,
    [name, code, brand, unit, price, min_stock, id]
  );
  return result.rows[0] || null;
};

const updateSparepartStock = async (id, stock) => {
  const result = await pool.query(
    `UPDATE spareparts
     SET stock=$1, updated_at=NOW()
     WHERE id=$2
     RETURNING *`,
    [stock, id]
  );
  return result.rows[0] || null;
};

const deleteSparepart = async (id) => {
  const result = await pool.query(
    `DELETE FROM spareparts WHERE id=$1 RETURNING id`,
    [id]
  );
  return result.rows[0] || null;
};

const getLowStockSpareparts = async () => {
  const result = await pool.query(
    `SELECT id, name, code, brand, unit, stock, min_stock
     FROM spareparts
     WHERE stock <= min_stock AND is_active = true
     ORDER BY stock ASC`
  );
  return result.rows;
};

module.exports = {
  getAllSpareparts,
  getSparepartById,
  createSparepart,
  updateSparepart,
  updateSparepartStock,
  deleteSparepart,
  getLowStockSpareparts,
};