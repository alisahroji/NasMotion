const {
  getRepairSpareparts,
  getRepairSparepartById,
  addRepairSparepart,
  updateRepairSparepart,
  removeRepairSparepart,
} = require("./repairs.service");
const { getQueueById } = require("../queues/queues.service");

/**
 * GET /api/repairs/:queue_id
 * Lihat semua sparepart yang dipakai di antrean ini
 */
const getByQueue = async (req, res) => {
  try {
    const { queue_id } = req.params;

    const queue = await getQueueById(queue_id);
    if (!queue) {
      return res.status(404).json({ success: false, message: "Antrean tidak ditemukan." });
    }

    const spareparts = await getRepairSpareparts(queue_id);

    const total = spareparts.reduce(
      (sum, item) => sum + parseFloat(item.subtotal),
      0
    );

    return res.status(200).json({
      success: true,
      queue_id,
      total_sparepart: total,
      data: spareparts,
    });
  } catch (err) {
    console.error("GetByQueue repair error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * POST /api/repairs/:queue_id/spareparts
 * Mekanik tambah sparepart ke perbaikan
 * Body: { sparepart_id, qty }
 */
const addSparepart = async (req, res) => {
  try {
    const { queue_id } = req.params;
    const { sparepart_id, qty } = req.body;

    if (!sparepart_id || !qty) {
      return res.status(400).json({
        success: false,
        message: "sparepart_id dan qty wajib diisi.",
      });
    }

    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "qty harus lebih dari 0.",
      });
    }

    // Validasi queue ada & statusnya in_progress
    const queue = await getQueueById(queue_id);
    if (!queue) {
      return res.status(404).json({ success: false, message: "Antrean tidak ditemukan." });
    }

    if (queue.status === "done" || queue.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Tidak bisa tambah sparepart pada antrean yang sudah selesai atau dibatalkan.",
      });
    }

    const item = await addRepairSparepart({ queue_id, sparepart_id, qty });

    return res.status(201).json({
      success: true,
      message: "Sparepart berhasil ditambahkan ke perbaikan.",
      data: item,
    });
  } catch (err) {
    console.error("AddSparepart repair error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/repairs/spareparts/:id
 * Update qty sparepart di repair
 * Body: { qty }
 */
const updateSparepart = async (req, res) => {
  try {
    const { id } = req.params;
    const { qty } = req.body;

    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "qty wajib diisi dan harus lebih dari 0.",
      });
    }

    const existing = await getRepairSparepartById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
    }

    const updated = await updateRepairSparepart(id, qty);

    return res.status(200).json({
      success: true,
      message: "Qty sparepart berhasil diupdate.",
      data: updated,
    });
  } catch (err) {
    console.error("UpdateSparepart repair error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/repairs/spareparts/:id
 * Hapus sparepart dari repair — stok kembali via trigger
 */
const removeSparepart = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await getRepairSparepartById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
    }

    await removeRepairSparepart(id);

    return res.status(200).json({
      success: true,
      message: "Sparepart berhasil dihapus dari perbaikan. Stok telah dikembalikan.",
    });
  } catch (err) {
    console.error("RemoveSparepart repair error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

module.exports = { getByQueue, addSparepart, updateSparepart, removeSparepart };