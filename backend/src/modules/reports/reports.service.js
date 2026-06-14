const pool = require("../../config/db");

/**
 * Stats untuk Dashboard Admin
 */
const getDashboardStats = async () => {
  const [queues, revenue, mechanics, lowStock, todayQueue] = await Promise.all([
    // Total antrean by status hari ini
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'waiting')     AS waiting,
        COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
        COUNT(*) FILTER (WHERE status = 'done')        AS done,
        COUNT(*) FILTER (WHERE status = 'cancelled')   AS cancelled,
        COUNT(*)                                        AS total
      FROM queues
      WHERE DATE(created_at) = CURRENT_DATE
    `),

    // Pendapatan hari ini & bulan ini
    pool.query(`
      SELECT
        COALESCE(SUM(total_amount) FILTER (WHERE DATE(paid_at) = CURRENT_DATE), 0)        AS today,
        COALESCE(SUM(total_amount) FILTER (WHERE DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', NOW())), 0) AS this_month
      FROM invoices
      WHERE payment_status = 'paid'
    `),

    // Total mekanik aktif
    pool.query(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE role = 'mekanik' AND is_active = true
    `),

    // Sparepart hampir habis
    pool.query(`
      SELECT COUNT(*) AS total
      FROM spareparts
      WHERE stock <= min_stock AND is_active = true
    `),

    // Antrean 7 hari terakhir (untuk grafik)
    pool.query(`
      SELECT
        DATE(created_at)  AS date,
        COUNT(*)          AS total,
        COUNT(*) FILTER (WHERE status = 'done') AS completed
      FROM queues
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `),
  ]);

  return {
    queue_today: queues.rows[0],
    revenue: revenue.rows[0],
    active_mechanics: parseInt(mechanics.rows[0].total),
    low_stock_count: parseInt(lowStock.rows[0].total),
    queue_chart: todayQueue.rows,
  };
};

/**
 * Laporan pendapatan dengan filter tanggal
 */
const getRevenueReport = async ({ date_from, date_to, kasir_id }) => {
  let query = `
    SELECT
      i.id,
      i.invoice_number,
      i.total_service,
      i.total_sparepart,
      i.total_amount,
      i.payment_method,
      i.payment_status,
      i.paid_at,
      i.created_at,
      v.plate_number,
      v.owner_name,
      v.vehicle_type,
      v.vehicle_brand,
      q.queue_number,
      k.name AS kasir_name
    FROM invoices i
    JOIN queues   q ON i.queue_id   = q.id
    JOIN vehicles v ON q.vehicle_id = v.id
    JOIN users    k ON i.kasir_id   = k.id
    WHERE i.payment_status = 'paid'
  `;
  const params = [];

  if (date_from) {
    params.push(date_from);
    query += ` AND DATE(i.paid_at) >= $${params.length}`;
  }

  if (date_to) {
    params.push(date_to);
    query += ` AND DATE(i.paid_at) <= $${params.length}`;
  }

  if (kasir_id) {
    params.push(kasir_id);
    query += ` AND i.kasir_id = $${params.length}`;
  }

  query += ` ORDER BY i.paid_at DESC`;

  const result = await pool.query(query, params);

  const total = result.rows.reduce((sum, r) => sum + parseFloat(r.total_amount), 0);
  const total_service = result.rows.reduce((sum, r) => sum + parseFloat(r.total_service), 0);
  const total_sparepart = result.rows.reduce((sum, r) => sum + parseFloat(r.total_sparepart), 0);

  return {
    summary: { total, total_service, total_sparepart, count: result.rows.length },
    data: result.rows,
  };
};

/**
 * Performa mekanik
 */
const getMechanicPerformance = async ({ date_from, date_to }) => {
  let query = `
    SELECT
      u.id,
      u.name,
      COUNT(q.id)                                    AS total_handled,
      COUNT(q.id) FILTER (WHERE q.status = 'done')  AS total_done,
      ROUND(
        AVG(
          EXTRACT(EPOCH FROM (q.finished_at - q.started_at)) / 60
        ) FILTER (WHERE q.status = 'done' AND q.finished_at IS NOT NULL),
        2
      )                                              AS avg_duration_minutes
    FROM users u
    LEFT JOIN queues q ON q.mekanik_id = u.id
  `;
  const params = [];
  const conditions = [`u.role = 'mekanik'`];

  if (date_from) {
    params.push(date_from);
    conditions.push(`DATE(q.created_at) >= $${params.length}`);
  }

  if (date_to) {
    params.push(date_to);
    conditions.push(`DATE(q.created_at) <= $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += `
    GROUP BY u.id, u.name
    ORDER BY total_done DESC
  `;

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Laporan harian lengkap (untuk export)
 */
const getDailyReport = async ({ date_from, date_to }) => {
  let query = `
    SELECT
      i.invoice_number,
      DATE(i.paid_at)     AS tanggal,
      v.plate_number,
      v.owner_name,
      v.vehicle_type,
      v.vehicle_brand,
      q.complaint,
      m.name              AS mekanik,
      k.name              AS kasir,
      i.total_service,
      i.total_sparepart,
      i.total_amount,
      i.payment_method
    FROM invoices i
    JOIN queues   q ON i.queue_id   = q.id
    JOIN vehicles v ON q.vehicle_id = v.id
    JOIN users    k ON i.kasir_id   = k.id
    LEFT JOIN users m ON q.mekanik_id = m.id
    WHERE i.payment_status = 'paid'
  `;
  const params = [];

  if (date_from) {
    params.push(date_from);
    query += ` AND DATE(i.paid_at) >= $${params.length}`;
  }

  if (date_to) {
    params.push(date_to);
    query += ` AND DATE(i.paid_at) <= $${params.length}`;
  }

  query += ` ORDER BY i.paid_at DESC`;

  const result = await pool.query(query, params);
  return result.rows;
};

module.exports = {
  getDashboardStats,
  getRevenueReport,
  getMechanicPerformance,
  getDailyReport,
};