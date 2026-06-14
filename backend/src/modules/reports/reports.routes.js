const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/role");
const { dashboard, revenue, mechanics, exportPDF, exportExcel } =
  require("./reports.controller");

// Semua route reports hanya admin
router.use(verifyToken, authorizeRoles("admin"));

// GET /api/reports/dashboard          → stats dashboard
router.get("/dashboard", dashboard);

// GET /api/reports/revenue            → laporan pendapatan
router.get("/revenue", revenue);

// GET /api/reports/mechanics          → performa mekanik
router.get("/mechanics", mechanics);

// GET /api/reports/export/pdf         → export PDF
router.get("/export/pdf", exportPDF);

// GET /api/reports/export/excel       → export Excel
router.get("/export/excel", exportExcel);

module.exports = router;