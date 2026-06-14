const {
  getAllQueues,
  getQueueById,
  createQueue,
  updateQueueStatus,
  assignMekanik,
  updateQueueNotes,
  cancelQueue,
} = require("./queues.service");

/**
 * GET /api/queues
 * Query: ?status=waiting&mekanik_id=xxx&date=2025-01-01
 */
const getAll = async (req, res) => {
  try {
    const { status, mekanik_id, date } = req.query;

    // Mekanik hanya lihat antrean miliknya sendiri
    const filters = {
      status: status || null,
      mekanik_id:
        req.user.role === "mekanik" ? req.user.id : mekanik_id || null,
      date: date || null,
    };

    const queues = await getAllQueues(filters);
    return res.status(200).json({
      success: true,
      total: queues.length,
      data: queues,
    });
  } catch (err) {
    console.error("GetAll queues error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /api/queues/:id
 */
const getOne = async (req, res) => {
  try {
    const queue = await getQueueById(req.params.id);
    if (!queue) {
      return res.status(404).json({ success: false, message: "Antrean tidak ditemukan." });
    }
    return res.status(200).json({ success: true, data: queue });
  } catch (err) {
    console.error("GetOne queue error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * POST /api/queues
 * Body: { vehicle_id, complaint, service_ids[] }
 */
const create = async (req, res) => {
  try {
    const { vehicle_id, complaint, service_ids } = req.body;

    if (!vehicle_id || !complaint) {
      return res.status(400).json({
        success: false,
        message: "vehicle_id dan complaint wajib diisi.",
      });
    }

    const queue = await createQueue({
      vehicle_id,
      kasir_id: req.user.id,
      complaint,
      service_ids: service_ids || [],
    });

    // Ambil detail lengkap untuk response
    const detail = await getQueueById(queue.id);

    return res.status(201).json({
      success: true,
      message: `Kendaraan berhasil didaftarkan. Nomor antrean: ${queue.queue_number}`,
      data: detail,
    });
  } catch (err) {
    console.error("Create queue error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/queues/:id/status
 * Body: { status, notes? }
 * Mekanik: bisa update status
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["in_progress", "done"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status hanya boleh: in_progress atau done.",
      });
    }

    const queue = await getQueueById(id);
    if (!queue) {
      return res.status(404).json({ success: false, message: "Antrean tidak ditemukan." });
    }

    // Validasi urutan status
    const flow = { waiting: 1, in_progress: 2, done: 3 };
    if (flow[status] <= flow[queue.status]) {
      return res.status(400).json({
        success: false,
        message: `Status tidak bisa mundur dari '${queue.status}' ke '${status}'.`,
      });
    }

    // Wajib ada mekanik sebelum in_progress
    if (status === "in_progress" && !queue.mekanik_id) {
      return res.status(400).json({
        success: false,
        message: "Mekanik belum di-assign. Assign mekanik terlebih dahulu.",
      });
    }

    await updateQueueStatus(id, status);

    // Update notes jika dikirim
    if (notes) await updateQueueNotes(id, notes);

    const updated = await getQueueById(id);

    return res.status(200).json({
      success: true,
      message: `Status antrean berhasil diubah ke '${status}'.`,
      data: updated,
    });
  } catch (err) {
    console.error("UpdateStatus error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * PATCH /api/queues/:id/assign
 * Body: { mekanik_id }
 * Admin & Kasir bisa assign mekanik
 */
const assign = async (req, res) => {
  try {
    const { id } = req.params;
    const { mekanik_id } = req.body;

    if (!mekanik_id) {
      return res.status(400).json({
        success: false,
        message: "mekanik_id wajib diisi.",
      });
    }

    const queue = await getQueueById(id);
    if (!queue) {
      return res.status(404).json({ success: false, message: "Antrean tidak ditemukan." });
    }

    if (queue.status === "done" || queue.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Tidak bisa assign mekanik pada antrean yang sudah selesai atau dibatalkan.",
      });
    }

    await assignMekanik(id, mekanik_id);
    const updated = await getQueueById(id);

    return res.status(200).json({
      success: true,
      message: "Mekanik berhasil di-assign.",
      data: updated,
    });
  } catch (err) {
    console.error("Assign error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * DELETE /api/queues/:id
 * Admin cancel antrean
 */
const cancel = async (req, res) => {
  try {
    const { id } = req.params;

    const queue = await getQueueById(id);
    if (!queue) {
      return res.status(404).json({ success: false, message: "Antrean tidak ditemukan." });
    }

    if (queue.status === "done") {
      return res.status(400).json({
        success: false,
        message: "Tidak bisa membatalkan antrean yang sudah selesai.",
      });
    }

    if (queue.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Antrean sudah dibatalkan sebelumnya.",
      });
    }

    const cancelled = await cancelQueue(id);

    return res.status(200).json({
      success: true,
      message: "Antrean berhasil dibatalkan.",
      data: cancelled,
    });
  } catch (err) {
    console.error("Cancel queue error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

module.exports = { getAll, getOne, create, updateStatus, assign, cancel };