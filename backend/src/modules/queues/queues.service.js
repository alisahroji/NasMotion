const pool = require("../../config/db");

/**
 * Ambil semua antrean dengan detail lengkap
 */
const getAllQueues = async ({ status, mekanik_id, date }) => {
  let query = `
    SELECT
      q.id,
      q.queue_number,
      q.complaint,
      q.status,
      q.started_at,
      q.finished_at,
      q.notes,
      q.created_at,
      q.updated_at,
      -- Data kendaraan
      v.id          AS vehicle_id,
      v.plate_number,
      v.owner_name,
      v.phone,
      v.vehicle_type,
      v.vehicle_brand,
      -- Data kasir
      k.id          AS kasir_id,
      k.name        AS kasir_name,
      -- Data mekanik
      m.id          AS mekanik_id,
      m.name        AS mekanik_name,
      -- Invoice status
      i.id          AS invoice_id,
      i.payment_status
    FROM queues q
    JOIN vehicles v       ON q.vehicle_id  = v.id
    JOIN users k          ON q.kasir_id    = k.id
    LEFT JOIN users m     ON q.mekanik_id  = m.id
    LEFT JOIN invoices i  ON q.id          = i.queue_id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND q.status = $${params.length}`;
  }

  if (mekanik_id) {
    params.push(mekanik_id);
    query += ` AND q.mekanik_id = $${params.length}`;
  }

  if (date) {
    params.push(date);
    query += ` AND DATE(q.created_at) = $${params.length}`;
  }

  query += ` ORDER BY q.queue_number ASC`;

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Ambil detail antrean by ID
 */
const getQueueById = async (id) => {
  const result = await pool.query(
    `SELECT
       q.id,
       q.queue_number,
       q.complaint,
       q.status,
       q.started_at,
       q.finished_at,
       q.notes,
       q.created_at,
       q.updated_at,
       v.id          AS vehicle_id,
       v.plate_number,
       v.owner_name,
       v.phone,
       v.vehicle_type,
       v.vehicle_brand,
       k.id          AS kasir_id,
       k.name        AS kasir_name,
       m.id          AS mekanik_id,
       m.name        AS mekanik_name,
       -- Servis
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object(
             'id', qs.id,
             'service_id', qs.service_id,
             'service_name', sc.name,
             'price', qs.price_snapshot
           )
         ) FILTER (WHERE qs.id IS NOT NULL), '[]'
       ) AS services,
       -- Sparepart
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object(
             'id', rs.id,
             'sparepart_id', rs.sparepart_id,
             'sparepart_name', sp.name,
             'qty', rs.qty,
             'price', rs.price_snapshot
           )
         ) FILTER (WHERE rs.id IS NOT NULL), '[]'
       ) AS spareparts,
       i.id          AS invoice_id,
       i.total_amount,
       i.payment_status
     FROM queues q
     JOIN vehicles v         ON q.vehicle_id  = v.id
     JOIN users k            ON q.kasir_id    = k.id
     LEFT JOIN users m       ON q.mekanik_id  = m.id
     LEFT JOIN queue_services qs  ON q.id = qs.queue_id
     LEFT JOIN service_catalog sc ON qs.service_id = sc.id
     LEFT JOIN repair_spareparts rs ON q.id = rs.queue_id
     LEFT JOIN spareparts sp  ON rs.sparepart_id = sp.id
     LEFT JOIN invoices i     ON q.id = i.queue_id
     WHERE q.id = $1
     GROUP BY q.id, v.id, k.id, m.id, i.id`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Buat antrean baru
 */
const createQueue = async ({ vehicle_id, kasir_id, complaint, service_ids }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert queue
    const queueResult = await client.query(
      `INSERT INTO queues (vehicle_id, kasir_id, complaint)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [vehicle_id, kasir_id, complaint]
    );
    const queue = queueResult.rows[0];

    // Insert queue_services jika ada
    if (service_ids && service_ids.length > 0) {
      for (const service_id of service_ids) {
        // Ambil harga dari service_catalog sebagai snapshot
        const svcResult = await client.query(
          `SELECT price FROM service_catalog WHERE id = $1 AND is_active = true`,
          [service_id]
        );
        if (svcResult.rows.length === 0) {
          throw new Error(`Service ID ${service_id} tidak ditemukan atau tidak aktif.`);
        }
        await client.query(
          `INSERT INTO queue_services (queue_id, service_id, price_snapshot)
           VALUES ($1, $2, $3)`,
          [queue.id, service_id, svcResult.rows[0].price]
        );
      }
    }

    await client.query("COMMIT");
    return queue;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Update status antrean
 */
const updateQueueStatus = async (id, status) => {
  let extraFields = "";
  if (status === "in_progress") extraFields = ", started_at = NOW()";
  if (status === "done") extraFields = ", finished_at = NOW()";

  const result = await pool.query(
    `UPDATE queues
     SET status = $1 ${extraFields}, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );
  return result.rows[0] || null;
};

/**
 * Assign mekanik ke antrean
 */
const assignMekanik = async (id, mekanik_id) => {
  const result = await pool.query(
    `UPDATE queues
     SET mekanik_id = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [mekanik_id, id]
  );
  return result.rows[0] || null;
};

/**
 * Update catatan mekanik
 */
const updateQueueNotes = async (id, notes) => {
  const result = await pool.query(
    `UPDATE queues SET notes = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [notes, id]
  );
  return result.rows[0] || null;
};

/**
 * Cancel / hapus antrean
 */
const cancelQueue = async (id) => {
  const result = await pool.query(
    `UPDATE queues
     SET status = 'cancelled', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};

module.exports = {
  getAllQueues,
  getQueueById,
  createQueue,
  updateQueueStatus,
  assignMekanik,
  updateQueueNotes,
  cancelQueue,
};