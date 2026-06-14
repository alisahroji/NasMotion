const {
  getAllInvoices,
  getInvoiceById,
  getInvoiceByQueueId,
  createInvoice,
  markAsPaid,
} = require("./invoices.service");
const { getQueueById } = require("../queues/queues.service");

/**
 * GET /api/invoices
 * Query: ?payment_status=unpaid&date_from=2025-01-01&date_to=2025-12-31
 */
const getAll = async (req, res) => {
  try {
    const { payment_status, kasir_id, date_from, date_to } = req.query;

    // Kasir hanya lihat invoice miliknya
    const filters = {
      payment_status: payment_status || null,
      kasir_id: req.user.role === "kasir" ? req.user.id : kasir_id || null,
      date_from: date_from || null,
      date_to: date_to || null,
    };

    const invoices = await getAllInvoices(filters);

    const totalRevenue = invoices
      .filter((i) => i.payment_status === "paid")
      .reduce((sum, i) => sum + parseFloat(i.total_amount), 0);

    return res.status(200).json({
      success: true,
      total: invoices.length,
      total_revenue: totalRevenue,
      data: invoices,
    });
  } catch (err) {
    console.error("GetAll invoices error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /api/invoices/:id
 */
const getOne = async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice tidak ditemukan." });
    }
    return res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    console.error("GetOne invoice error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * POST /api/invoices
 * Body: { queue_id, payment_method, notes? }
 */
const create = async (req, res) => {
  try {
    const { queue_id, payment_method, notes } = req.body;

    if (!queue_id) {
      return res.status(400).json({
        success: false,
        message: "queue_id wajib diisi.",
      });
    }

    // Validasi queue ada
    const queue = await getQueueById(queue_id);
    if (!queue) {
      return res.status(404).json({ success: false, message: "Antrean tidak ditemukan." });
    }

    // Queue harus selesai sebelum bisa dibuat invoice
    if (queue.status !== "done") {
      return res.status(400).json({
        success: false,
        message: "Invoice hanya bisa dibuat untuk antrean yang sudah selesai (done).",
      });
    }

    // Cek invoice sudah ada
    const existing = await getInvoiceByQueueId(queue_id);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Invoice untuk antrean ini sudah ada.",
        invoice_id: existing.id,
      });
    }

    const invoice = await createInvoice({
      queue_id,
      kasir_id: req.user.id,
      payment_method: payment_method || "cash",
      notes: notes || null,
    });

    // Ambil detail lengkap untuk response
    const detail = await getInvoiceById(invoice.id);

    return res.status(201).json({
      success: true,
      message: `Invoice ${invoice.invoice_number} berhasil dibuat.`,
      data: detail,
    });
  } catch (err) {
    console.error("Create invoice error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/invoices/:id/pay
 * Body: { payment_method }
 */
const pay = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;

    const invoice = await getInvoiceById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice tidak ditemukan." });
    }

    if (invoice.payment_status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Invoice ini sudah lunas.",
      });
    }

    const updated = await markAsPaid(id, payment_method || "cash");

    return res.status(200).json({
      success: true,
      message: "Pembayaran berhasil dicatat. Invoice lunas.",
      data: updated,
    });
  } catch (err) {
    console.error("Pay invoice error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

module.exports = { getAll, getOne, create, pay };