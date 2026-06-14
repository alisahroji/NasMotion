const pool = require("../../config/db");

/**
 * Ambil semua sparepart yang dipakai di suatu antrean
 */
const getRepairSpareparts = async (queue_id) => {
  const result = await pool.query(
    `SELECT
       rs.id,
       rs.queue_id,
       rs.sparepart_id,
       sp.name        AS sparepart_name,
       sp.code        AS sparepart_code,
       sp.unit,
       rs.qty,
       rs.price_snapshot,
       (rs.qty * rs.price_snapshot) AS subtotal,
       rs.created_at
     FROM repair_spareparts rs
     JOIN spareparts sp ON rs.sparepart_id = sp.id
     WHERE rs.queue_id = $1
     ORDER BY rs.created_at ASC`,
    [queue_id]
  );
  return result.rows;
};

/**
 * Ambil satu repair sparepart by ID
 */
const getRepairSparepartById = async (id) => {
  const result = await pool.query(
    `SELECT rs.*, sp.name AS sparepart_name, sp.stock
     FROM repair_spareparts rs
     JOIN spareparts sp ON rs.sparepart_id = sp.id
     WHERE rs.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Tambah sparepart ke repair
 * Stok otomatis berkurang via trigger di DB
 */
const addRepairSparepart = async ({ queue_id, sparepart_id, qty }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ambil harga sparepart sebagai snapshot
    const spResult = await client.query(
      `SELECT price, stock, name FROM spareparts WHERE id = $1 AND is_active = true`,
      [sparepart_id]
    );

    if (spResult.rows.length === 0) {
      throw new Error("Sparepart tidak ditemukan atau tidak aktif.");
    }

    const sparepart = spResult.rows[0];

    if (sparepart.stock < qty) {
      throw new Error(
        `Stok ${sparepart.name} tidak mencukupi. Stok tersedia: ${sparepart.stock}`
      );
    }

    // Insert — trigger DB akan kurangi stok otomatis
    const result = await client.query(
      `INSERT INTO repair_spareparts (queue_id, sparepart_id, qty, price_snapshot)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [queue_id, sparepart_id, qty, sparepart.price]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Update qty sparepart di repair
 */
const updateRepairSparepart = async (id, qty) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ambil data lama
    const oldResult = await client.query(
      `SELECT rs.qty, rs.sparepart_id, sp.stock, sp.name
       FROM repair_spareparts rs
       JOIN spareparts sp ON rs.sparepart_id = sp.id
       WHERE rs.id = $1`,
      [id]
    );

    if (oldResult.rows.length === 0) throw new Error("Data tidak ditemukan.");

    const old = oldResult.rows[0];
    const diff = qty - old.qty; // selisih qty

    // Cek stok cukup jika qty bertambah
    if (diff > 0 && old.stock < diff) {
      throw new Error(
        `Stok ${old.name} tidak mencukupi. Stok tersedia: ${old.stock}`
      );
    }

    // Update stok manual (trigger hanya untuk INSERT/DELETE)
    await client.query(
      `UPDATE spareparts SET stock = stock - $1, updated_at = NOW() WHERE id = $2`,
      [diff, old.sparepart_id]
    );

    // Update qty
    const result = await client.query(
      `UPDATE repair_spareparts SET qty = $1 WHERE id = $2 RETURNING *`,
      [qty, id]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Hapus sparepart dari repair
 * Stok otomatis kembali via trigger di DB
 */
const removeRepairSparepart = async (id) => {
  const result = await pool.query(
    `DELETE FROM repair_spareparts WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Hitung total sparepart per antrean
 */
const getTotalSparepart = async (queue_id) => {
  const result = await pool.query(
    `SELECT COALESCE(SUM(qty * price_snapshot), 0) AS total
     FROM repair_spareparts
     WHERE queue_id = $1`,
    [queue_id]
  );
  return parseFloat(result.rows[0].total);
};

module.exports = {
  getRepairSpareparts,
  getRepairSparepartById,
  addRepairSparepart,
  updateRepairSparepart,
  removeRepairSparepart,
  getTotalSparepart,
};