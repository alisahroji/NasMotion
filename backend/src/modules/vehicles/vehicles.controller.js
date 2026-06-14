const {
  getAllVehicles,
  getVehicleById,
  getVehicleByPlate,
  createVehicle,
  updateVehicle,
  getVehicleHistory,
} = require("./vehicles.service");

/**
 * GET /api/vehicles?search=honda
 */
const getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const vehicles = await getAllVehicles({ search });
    return res.status(200).json({
      success: true,
      total: vehicles.length,
      data: vehicles,
    });
  } catch (err) {
    console.error("GetAll vehicles error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /api/vehicles/:id
 */
const getOne = async (req, res) => {
  try {
    const vehicle = await getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Kendaraan tidak ditemukan." });
    }
    return res.status(200).json({ success: true, data: vehicle });
  } catch (err) {
    console.error("GetOne vehicle error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /api/vehicles/plate/:plate
 */
const getByPlate = async (req, res) => {
  try {
    const vehicle = await getVehicleByPlate(req.params.plate);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Kendaraan dengan plat tersebut tidak ditemukan.",
      });
    }

    // Sekalian ambil histori servis
    const history = await getVehicleHistory(vehicle.id);

    return res.status(200).json({
      success: true,
      data: { ...vehicle, history },
    });
  } catch (err) {
    console.error("GetByPlate error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * POST /api/vehicles
 * Body: { plate_number, owner_name, phone, vehicle_type, vehicle_brand, vehicle_year }
 */
const create = async (req, res) => {
  try {
    const { plate_number, owner_name, phone, vehicle_type, vehicle_brand, vehicle_year } =
      req.body;

    // Validasi wajib
    if (!plate_number || !owner_name || !vehicle_type) {
      return res.status(400).json({
        success: false,
        message: "plate_number, owner_name, dan vehicle_type wajib diisi.",
      });
    }

    // Cek plat sudah ada
    const existing = await getVehicleByPlate(plate_number);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Plat nomor sudah terdaftar.",
        data: existing, // kirim data yang sudah ada supaya kasir bisa langsung pakai
      });
    }

    const vehicle = await createVehicle({
      plate_number: plate_number.toUpperCase(),
      owner_name,
      phone,
      vehicle_type,
      vehicle_brand,
      vehicle_year,
    });

    return res.status(201).json({
      success: true,
      message: "Kendaraan berhasil didaftarkan.",
      data: vehicle,
    });
  } catch (err) {
    console.error("Create vehicle error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * PUT /api/vehicles/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { owner_name, phone, vehicle_type, vehicle_brand, vehicle_year } = req.body;

    if (!owner_name || !vehicle_type) {
      return res.status(400).json({
        success: false,
        message: "owner_name dan vehicle_type wajib diisi.",
      });
    }

    const existing = await getVehicleById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Kendaraan tidak ditemukan." });
    }

    const updated = await updateVehicle(id, {
      owner_name,
      phone,
      vehicle_type,
      vehicle_brand,
      vehicle_year,
    });

    return res.status(200).json({
      success: true,
      message: "Data kendaraan berhasil diupdate.",
      data: updated,
    });
  } catch (err) {
    console.error("Update vehicle error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /api/vehicles/:id/history
 */
const getHistory = async (req, res) => {
  try {
    const vehicle = await getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Kendaraan tidak ditemukan." });
    }

    const history = await getVehicleHistory(req.params.id);

    return res.status(200).json({
      success: true,
      vehicle,
      total: history.length,
      data: history,
    });
  } catch (err) {
    console.error("GetHistory error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

module.exports = { getAll, getOne, getByPlate, create, update, getHistory };