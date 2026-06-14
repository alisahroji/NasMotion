const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  toggleServiceStatus,
  deleteService,
} = require("./services.service");

const getAll = async (req, res) => {
  try {
    const { search, is_active } = req.query;
    const services = await getAllServices({
      search,
      is_active: is_active !== undefined ? is_active === "true" : undefined,
    });
    return res.status(200).json({ success: true, total: services.length, data: services });
  } catch (err) {
    console.error("GetAll services error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

const getOne = async (req, res) => {
  try {
    const service = await getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Layanan tidak ditemukan." });
    }
    return res.status(200).json({ success: true, data: service });
  } catch (err) {
    console.error("GetOne service error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

const create = async (req, res) => {
  try {
    const { name, description, price, duration_est } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "name dan price wajib diisi.",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: "price tidak boleh negatif.",
      });
    }

    const service = await createService({
      name,
      description: description || null,
      price,
      duration_est: duration_est || 60,
    });

    return res.status(201).json({
      success: true,
      message: "Layanan berhasil ditambahkan.",
      data: service,
    });
  } catch (err) {
    console.error("Create service error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration_est } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "name dan price wajib diisi.",
      });
    }

    const existing = await getServiceById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Layanan tidak ditemukan." });
    }

    const updated = await updateService(id, { name, description, price, duration_est });

    return res.status(200).json({
      success: true,
      message: "Layanan berhasil diupdate.",
      data: updated,
    });
  } catch (err) {
    console.error("Update service error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await getServiceById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Layanan tidak ditemukan." });
    }

    const updated = await toggleServiceStatus(id);

    return res.status(200).json({
      success: true,
      message: `Layanan berhasil ${updated.is_active ? "diaktifkan" : "dinonaktifkan"}.`,
      data: updated,
    });
  } catch (err) {
    console.error("ToggleStatus service error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await getServiceById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Layanan tidak ditemukan." });
    }

    await deleteService(id);

    return res.status(200).json({ success: true, message: "Layanan berhasil dihapus." });
  } catch (err) {
    console.error("Delete service error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

module.exports = { getAll, getOne, create, update, toggleStatus, remove };