const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const {
  getDashboardStats,
  getRevenueReport,
  getMechanicPerformance,
  getDailyReport,
} = require("./reports.service");

/**
 * GET /api/reports/dashboard
 */
const dashboard = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /api/reports/revenue
 * Query: ?date_from=2025-01-01&date_to=2025-12-31&kasir_id=xxx
 */
const revenue = async (req, res) => {
  try {
    const { date_from, date_to, kasir_id } = req.query;
    const report = await getRevenueReport({ date_from, date_to, kasir_id });
    return res.status(200).json({ success: true, ...report });
  } catch (err) {
    console.error("Revenue report error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /api/reports/mechanics
 * Query: ?date_from=2025-01-01&date_to=2025-12-31
 */
const mechanics = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const data = await getMechanicPerformance({ date_from, date_to });
    return res.status(200).json({ success: true, total: data.length, data });
  } catch (err) {
    console.error("Mechanics report error:", err.message);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * GET /api/reports/export/pdf
 * Query: ?date_from=2025-01-01&date_to=2025-12-31
 */
const exportPDF = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const rows = await getDailyReport({ date_from, date_to });

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    // Header response
    const filename = `NasMotion_Laporan_${date_from || "all"}_${date_to || "all"}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    // ── Header PDF ─────────────────────────────────────────
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("NasMotion", { align: "center" })
      .fontSize(11)
      .font("Helvetica")
      .text("Laporan Perbaikan Kendaraan", { align: "center" });

    if (date_from || date_to) {
      doc
        .fontSize(9)
        .text(`Periode: ${date_from || "-"} s/d ${date_to || "-"}`, { align: "center" });
    }

    doc.moveDown(0.5);
    doc
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .strokeColor("#333")
      .stroke();
    doc.moveDown(0.5);

    // ── Tabel Header ───────────────────────────────────────
    const colX = [40, 100, 170, 235, 290, 360, 415, 480];
    const headers = ["Tgl", "Invoice", "Plat", "Pemilik", "Servis(Rp)", "Part(Rp)", "Total(Rp)", "Kasir"];

    doc.fontSize(8).font("Helvetica-Bold");
    headers.forEach((h, i) => doc.text(h, colX[i], doc.y, { width: colX[i + 1] - colX[i] - 4 }));
    doc.moveDown(0.3);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.2);

    // ── Tabel Rows ─────────────────────────────────────────
    doc.font("Helvetica").fontSize(7.5);
    let totalAmount = 0;

    rows.forEach((r, idx) => {
      const y = doc.y;

      // Background baris selang-seling
      if (idx % 2 === 0) {
        doc.rect(40, y - 2, 515, 14).fill("#f5f5f5").fillColor("black");
      }

      const tanggal = r.tanggal ? new Date(r.tanggal).toLocaleDateString("id-ID") : "-";
      const cells = [
        tanggal,
        r.invoice_number,
        r.plate_number,
        r.owner_name?.slice(0, 12),
        formatRp(r.total_service),
        formatRp(r.total_sparepart),
        formatRp(r.total_amount),
        r.kasir?.slice(0, 8),
      ];

      cells.forEach((cell, i) => {
        doc.text(String(cell ?? "-"), colX[i], y, {
          width: (colX[i + 1] || 555) - colX[i] - 4,
          lineBreak: false,
        });
      });

      totalAmount += parseFloat(r.total_amount || 0);
      doc.moveDown(0.9);

      // Pindah halaman jika hampir habis
      if (doc.y > 750) doc.addPage();
    });

    // ── Summary ────────────────────────────────────────────
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.3);
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(`Total Transaksi: ${rows.length}`, 40)
      .text(`Total Pendapatan: ${formatRp(totalAmount)}`, 40);

    doc.end();
  } catch (err) {
    console.error("Export PDF error:", err.message);
    return res.status(500).json({ success: false, message: "Gagal generate PDF." });
  }
};

/**
 * GET /api/reports/export/excel
 * Query: ?date_from=2025-01-01&date_to=2025-12-31
 */
const exportExcel = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const rows = await getDailyReport({ date_from, date_to });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "NasMotion";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Laporan Perbaikan");

    // ── Header Sheet ───────────────────────────────────────
    sheet.mergeCells("A1:J1");
    sheet.getCell("A1").value = "NASMOTION — Laporan Perbaikan Kendaraan";
    sheet.getCell("A1").font = { bold: true, size: 14 };
    sheet.getCell("A1").alignment = { horizontal: "center" };

    sheet.mergeCells("A2:J2");
    sheet.getCell("A2").value = `Periode: ${date_from || "Semua"} s/d ${date_to || "Semua"}`;
    sheet.getCell("A2").alignment = { horizontal: "center" };

    sheet.addRow([]);

    // ── Kolom Header ───────────────────────────────────────
    const headerRow = sheet.addRow([
      "No", "Tanggal", "Invoice", "Plat", "Pemilik",
      "Tipe", "Keluhan", "Mekanik", "Kasir",
      "Total Servis (Rp)", "Total Part (Rp)", "Total (Rp)", "Metode Bayar",
    ]);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" },
      };
    });

    // ── Data Rows ─────────────────────────────────────────
    let totalAmount = 0;
    let totalService = 0;
    let totalSparepart = 0;

    rows.forEach((r, idx) => {
      const row = sheet.addRow([
        idx + 1,
        r.tanggal ? new Date(r.tanggal).toLocaleDateString("id-ID") : "-",
        r.invoice_number,
        r.plate_number,
        r.owner_name,
        `${r.vehicle_brand || ""} ${r.vehicle_type || ""}`.trim(),
        r.complaint,
        r.mekanik || "-",
        r.kasir,
        parseFloat(r.total_service),
        parseFloat(r.total_sparepart),
        parseFloat(r.total_amount),
        r.payment_method || "cash",
      ]);

      // Zebra striping
      const fillColor = idx % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF";
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillColor } };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };
      });

      // Format angka
      ["J", "K", "L"].forEach((col) => {
        sheet.getCell(`${col}${row.number}`).numFmt = '#,##0';
      });

      totalAmount += parseFloat(r.total_amount || 0);
      totalService += parseFloat(r.total_service || 0);
      totalSparepart += parseFloat(r.total_sparepart || 0);
    });

    // ── Summary Row ────────────────────────────────────────
    const summaryRow = sheet.addRow([
      "", "", "", "", "", "", "", "", "TOTAL",
      totalService, totalSparepart, totalAmount, "",
    ]);
    summaryRow.eachCell((cell, colNum) => {
      cell.font = { bold: true };
      if (colNum >= 9) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFE0B2" } };
      }
    });
    ["J", "K", "L"].forEach((col) => {
      sheet.getCell(`${col}${summaryRow.number}`).numFmt = '#,##0';
    });

    // ── Column Width ───────────────────────────────────────
    sheet.columns = [
      { width: 5 }, { width: 12 }, { width: 22 }, { width: 14 },
      { width: 20 }, { width: 16 }, { width: 30 }, { width: 18 },
      { width: 14 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 14 },
    ];

    // ── Response ───────────────────────────────────────────
    const filename = `NasMotion_Laporan_${date_from || "all"}_${date_to || "all"}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export Excel error:", err.message);
    return res.status(500).json({ success: false, message: "Gagal generate Excel." });
  }
};

// Helper format Rupiah
const formatRp = (num) =>
  new Intl.NumberFormat("id-ID", { style: "decimal" }).format(parseFloat(num || 0));

module.exports = { dashboard, revenue, mechanics, exportPDF, exportExcel };