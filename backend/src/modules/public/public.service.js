const pool = require("../../config/db");

/**
 * Cari kendaraan by plat nomor (versi publik).
 * Sengaja TIDAK mengembalikan `phone` (data sensitif pemilik).
 */
const getPublicVehicleByPlate = async (plate_number) => {
  const result = await pool.query(
    `SELECT id, plate_number, owner_name,
            vehicle_type, vehicle_brand, vehicle_year
     FROM vehicles
     WHERE UPPER(plate_number) = UPPER($1)`,
    [plate_number]
  );
  return result.rows[0] || null;
};

/**
 * Riwayat/antrean servis kendaraan (versi publik).
 * Field internal yang dibuang dibanding endpoint internal:
 * - q.notes        (catatan internal mekanik/admin)
 * - spareparts     (detail biaya komponen)
 * - payment_status (data keuangan kasir)
 * - phone          (nomor HP pemilik)
 */
const getPublicHistory = async (vehicle_id) => {
  const result = await pool.query(
    `SELECT
       q.id,
       q.queue_number,
       q.complaint,
       q.status,
       q.started_at,
       q.finished_at,
       q.created_at,
       u.name AS mekanik_name,
       COALESCE(
         json_agg(
           DISTINCT jsonb_build_object('service_name', sc.name)
         ) FILTER (WHERE sc.id IS NOT NULL),
         '[]'
       ) AS services,
       inv.total_amount
     FROM queues q
     LEFT JOIN users u            ON q.mekanik_id = u.id
     LEFT JOIN queue_services qs  ON q.id = qs.queue_id
     LEFT JOIN service_catalog sc ON qs.service_id = sc.id
     LEFT JOIN invoices inv       ON q.id = inv.queue_id
     WHERE q.vehicle_id = $1
     GROUP BY q.id, u.name, inv.total_amount
     ORDER BY q.created_at DESC`,
    [vehicle_id]
  );
  return result.rows;
};

module.exports = { getPublicVehicleByPlate, getPublicHistory };
