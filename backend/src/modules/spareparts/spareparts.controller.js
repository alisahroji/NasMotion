const {
  getAllSpareparts,
  getSparepartById,
  createSparepart,
  updateSparepart,
  updateSparepartStock,
  deleteSparepart,
  getLowStockSpareparts,
} = require("./spareparts.service");

const getAll = async (req, res) => {
  try {
    const { search, is_active, low_stock } = req.query;
    const spareparts = await getAllSpareparts({
      search,
      is_active: is_active !== undefined ? is_active === "true" : undefined,
      low_stock,
    });
    return res.status(200).json({ success: true, total: spareparts.length, data: spareparts });
  } catch (err) {
    console.error("GetAll spareparts error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

const getOne = async (req, res) => {
  try {
    const sparepart = await getSparepartById(req.params.id);
    if (!sparepart) {
      return res.status(404).json({ success: false, message: "Sparepart tidak ditemukan." });
    }
    return res.status(200).json({ success: true, data: sparepart });
  } catch (err) {
    console.error("GetOne sparepart error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

const getLowStock = async (req, res) => {
  try {
    const spareparts = await getLowStockSpareparts();
    return res.status(200).json({ success: true, total: spareparts.length, data: spareparts });
  } catch (err) {
    console.error("GetLowStock error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

const create = async (req, res) => {
  try {
    const { name, code, brand, unit, price, stock, min_stock } = req.body;

    if (!name || !unit || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "name, unit, dan price wajib diisi.",
      });
    }

    if (price < 0 || stock < 0 || min_stock < 0) {
      return res.status(400).json({
        success: false,
        message: "price, stock, dan min_stock tidak boleh negatif.",
      });
    }

    const sparepart = await createSparepart({
      name,
      code: code || null,
      brand: brand || null,
      unit,
      price,
      stock: stock || 0,
      min_stock: min_stock || 5,
    });

    return res.status(201).json({
      success: true,
      message: "Sparepart berhasil ditambahkan.",
      data: sparepart,
    });
  } catch (err) {
    console.error("Create sparepart error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, brand, unit, price, min_stock } = req.body;

    if (!name || !unit || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "name, unit, dan price wajib diisi.",
      });
    }

    const existing = await getSparepartById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Sparepart tidak ditemukan." });
    }

    const updated = await updateSparepart(id, { name, code, brand, unit, price, min_stock });

    return res.status(200).json({
      success: true,
      message: "Sparepart berhasil diupdate.",
      data: updated,
    });
  } catch (err) {
    console.error("Update sparepart error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "stock wajib diisi dan tidak boleh negatif.",
      });
    }

    const existing = await getSparepartById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Sparepart tidak ditemukan." });
    }

    const updated = await updateSparepartStock(id, stock);

    return res.status(200).json({
      success: true,
      message: "Stok berhasil diupdate.",
      data: updated,
    });
  } catch (err) {
    console.error("UpdateStock error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getSparepartById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Sparepart tidak ditemukan." });
    }

    await deleteSparepart(id);

    return res.status(200).json({ success: true, message: "Sparepart berhasil dihapus." });
  } catch (err) {
    console.error("Delete sparepart error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

module.exports = { getAll, getOne, getLowStock, create, update, updateStock, remove };