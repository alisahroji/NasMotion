const pool = require("../../config/db");

/**
 * Generate nomor invoice: INV-YYYYMMDD-XXX
 */
const generateInvoiceNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  const result = await pool.query(
    `SELECT COUNT(*) AS count FROM invoices
     WHERE DATE(created_at) = CURRENT_DATE`
  );

  const count = parseInt(result.rows[0].count) + 1;
  const seq = String(count).padStart(3, "0");
  return `INV-${dateStr}-${seq}`;
};

/**
 * Ambil semua invoice
 */
const getAllInvoices = async ({ payment_status, kasir_id, date_from, date_to }) => {
  let query = `
    SELECT
      i.id,
      i.invoice_number,
      i.total_service,
      i.total_sparepart,
      i.total_amount,
      i.payment_status,
      i.payment_method,
      i.paid_at,
      i.notes,
      i.created_at,
      -- Queue info
      q.queue_number,
      q.complaint,
      -- Vehicle info
      v.plate_number,
      v.owner_name,
      v.vehicle_type,
      v.vehicle_brand,
      -- Kasir info
      k.name AS kasir_name
    FROM invoices i
    JOIN queues q   ON i.queue_id  = q.id
    JOIN vehicles v ON q.vehicle_id = v.id
    JOIN users k    ON i.kasir_id  = k.id
    WHERE 1=1
  `;
  const params = [];

  if (payment_status) {
    params.push(payment_status);
    query += ` AND i.payment_status = $${params.length}`;
  }

  if (kasir_id) {
    params.push(kasir_id);
    query += ` AND i.kasir_id = $${params.length}`;
  }

  if (date_from) {
    params.push(date_from);
    query += ` AND DATE(i.created_at) >= $${params.length}`;
  }

  if (date_to) {
    params.push(date_to);
    query += ` AND DATE(i.created_at) <= $${params.length}`;
  }

  query += ` ORDER BY i.created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Ambil detail invoice lengkap
 */
const getInvoiceById = async (id) => {
  const result = await pool.query(
    `SELECT
       i.*,
       q.queue_number,
       q.complaint,
       q.started_at,
       q.finished_at,
       q.notes AS repair_notes,
       v.plate_number,
       v.owner_name,
       v.phone,
       v.vehicle_type,
       v.vehicle_brand,
       v.vehicle_year,
       k.name  AS kasir_name,
       m.name  AS mekanik_name,
       -- Servis
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object(
             'service_name', sc.name,
             'price', qs.price_snapshot
           )
         ) FILTER (WHERE qs.id IS NOT NULL), '[]'
       ) AS services,
       -- Sparepart
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object(
             'sparepart_name', sp.name,
             'unit', sp.unit,
             'qty', rs.qty,
             'price', rs.price_snapshot,
             'subtotal', rs.qty * rs.price_snapshot
           )
         ) FILTER (WHERE rs.id IS NOT NULL), '[]'
       ) AS spareparts
     FROM invoices i
     JOIN queues q         ON i.queue_id     = q.id
     JOIN vehicles v       ON q.vehicle_id   = v.id
     JOIN users k          ON i.kasir_id     = k.id
     LEFT JOIN users m     ON q.mekanik_id   = m.id
     LEFT JOIN queue_services qs  ON q.id    = qs.queue_id
     LEFT JOIN service_catalog sc ON qs.service_id = sc.id
     LEFT JOIN repair_spareparts rs ON q.id  = rs.queue_id
     LEFT JOIN spareparts sp ON rs.sparepart_id = sp.id
     WHERE i.id = $1
     GROUP BY i.id, q.id, v.id, k.name, m.name`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Cek invoice sudah ada untuk queue ini
 */
const getInvoiceByQueueId = async (queue_id) => {
  const result = await pool.query(
    `SELECT id FROM invoices WHERE queue_id = $1`,
    [queue_id]
  );
  return result.rows[0] || null;
};

/**
 * Buat invoice — hitung otomatis dari services + spareparts
 */
const createInvoice = async ({ queue_id, kasir_id, payment_method, notes }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Hitung total service
    const svcResult = await client.query(
      `SELECT COALESCE(SUM(price_snapshot), 0) AS total
       FROM queue_services WHERE queue_id = $1`,
      [queue_id]
    );
    const total_service = parseFloat(svcResult.rows[0].total);

    // Hitung total sparepart
    const spResult = await client.query(
      `SELECT COALESCE(SUM(qty * price_snapshot), 0) AS total
       FROM repair_spareparts WHERE queue_id = $1`,
      [queue_id]
    );
    const total_sparepart = parseFloat(spResult.rows[0].total);

    const total_amount = total_service + total_sparepart;
    const invoice_number = await generateInvoiceNumber();

    const result = await client.query(
      `INSERT INTO invoices
         (invoice_number, queue_id, kasir_id, total_service, total_sparepart, total_amount, payment_method, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [invoice_number, queue_id, kasir_id, total_service, total_sparepart, total_amount, payment_method, notes]
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
 * Tandai invoice sebagai lunas
 */
const markAsPaid = async (id, payment_method) => {
  const result = await pool.query(
    `UPDATE invoices
     SET payment_status = 'paid',
         payment_method = $1,
         paid_at = NOW(),
         updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [payment_method, id]
  );
  return result.rows[0] || null;
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoiceByQueueId,
  createInvoice,
  markAsPaid,
};