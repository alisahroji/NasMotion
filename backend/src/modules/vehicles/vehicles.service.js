const pool = require("../../config/db");

/**
 * Ambil semua kendaraan
 */
const getAllVehicles = async ({ search }) => {
  let query = `
    SELECT id, plate_number, owner_name, phone, 
           vehicle_type, vehicle_brand, vehicle_year,
           created_at, updated_at
    FROM vehicles
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (
      plate_number ILIKE $${params.length} OR
      owner_name   ILIKE $${params.length} OR
      vehicle_brand ILIKE $${params.length}
    )`;
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Ambil kendaraan by ID
 */
const getVehicleById = async (id) => {
  const result = await pool.query(
    `SELECT id, plate_number, owner_name, phone,
            vehicle_type, vehicle_brand, vehicle_year,
            created_at, updated_at
     FROM vehicles WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Cari kendaraan by plat nomor
 */
const getVehicleByPlate = async (plate_number) => {
  const result = await pool.query(
    `SELECT id, plate_number, owner_name, phone,
            vehicle_type, vehicle_brand, vehicle_year,
            created_at, updated_at
     FROM vehicles WHERE UPPER(plate_number) = UPPER($1)`,
    [plate_number]
  );
  return result.rows[0] || null;
};

/**
 * Buat kendaraan baru
 */
const createVehicle = async ({
  plate_number,
  owner_name,
  phone,
  vehicle_type,
  vehicle_brand,
  vehicle_year,
}) => {
  const result = await pool.query(
    `INSERT INTO vehicles 
       (plate_number, owner_name, phone, vehicle_type, vehicle_brand, vehicle_year)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [plate_number, owner_name, phone, vehicle_type, vehicle_brand, vehicle_year]
  );
  return result.rows[0];
};

/**
 * Update kendaraan
 */
const updateVehicle = async (
  id,
  { owner_name, phone, vehicle_type, vehicle_brand, vehicle_year }
) => {
  const result = await pool.query(
    `UPDATE vehicles
     SET owner_name = $1, phone = $2, vehicle_type = $3,
         vehicle_brand = $4, vehicle_year = $5, updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [owner_name, phone, vehicle_type, vehicle_brand, vehicle_year, id]
  );
  return result.rows[0] || null;
};

/**
 * Riwayat servis kendaraan by vehicle ID
 */
const getVehicleHistory = async (vehicle_id) => {
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
       u.name AS mekanik_name,
       -- Servis yang dipakai
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object(
             'service_name', sc.name,
             'price', qs.price_snapshot
           )
         ) FILTER (WHERE sc.id IS NOT NULL),
         '[]'
       ) AS services,
       -- Sparepart yang dipakai
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object(
             'sparepart_name', sp.name,
             'qty', rs.qty,
             'price', rs.price_snapshot
           )
         ) FILTER (WHERE sp.id IS NOT NULL),
         '[]'
       ) AS spareparts,
       i.total_amount,
       i.payment_status
     FROM queues q
     LEFT JOIN users u           ON q.mekanik_id = u.id
     LEFT JOIN queue_services qs ON q.id = qs.queue_id
     LEFT JOIN service_catalog sc ON qs.service_id = sc.id
     LEFT JOIN repair_spareparts rs ON q.id = rs.queue_id
     LEFT JOIN spareparts sp     ON rs.sparepart_id = sp.id
     LEFT JOIN invoices i        ON q.id = i.queue_id
     WHERE q.vehicle_id = $1
     GROUP BY q.id, u.name, i.total_amount, i.payment_status
     ORDER BY q.created_at DESC`,
    [vehicle_id]
  );
  return result.rows;
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  getVehicleByPlate,
  createVehicle,
  updateVehicle,
  getVehicleHistory,
};