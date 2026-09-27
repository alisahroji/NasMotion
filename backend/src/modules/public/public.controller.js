const {
  getPublicVehicleByPlate,
  getPublicHistory,
} = require("./public.service");

/**
 * GET /api/public/vehicles/status/:plate
 *
 * Endpoint PUBLIK (tanpa JWT / role) khusus untuk halaman "Cek Status".
 * Sengaja terpisah dari /api/vehicles/* yang tetap terproteksi.
 * Tidak mengembalikan data sensitif: phone, notes internal,
 * sparepart, payment_status, data user internal.
 */
const trackByPlate = async (req, res) => {
  try {
    // Normalisasi konsisten dengan flow existing (trim + uppercase;
    // kecocokan case-insensitive di DB via UPPER(plate_number)).
    const plate = (req.params.plate || "").trim().toUpperCase();

    if (!plate) {
      return res.status(400).json({
        success: false,
        message: "Plat nomor wajib diisi.",
      });
    }

    const vehicle = await getPublicVehicleByPlate(plate);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Kendaraan dengan plat tersebut tidak ditemukan.",
      });
    }

    const history = await getPublicHistory(vehicle.id);

    return res.status(200).json({
      success: true,
      data: { ...vehicle, history },
    });
  } catch (err) {
    console.error("Public trackByPlate error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

module.exports = { trackByPlate };
