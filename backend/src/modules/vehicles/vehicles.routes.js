const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/role");
const { getAll, getOne, getByPlate, create, update, getHistory } =
  require("./vehicles.controller");

router.use(verifyToken);

// GET  /api/vehicles                    → semua kendaraan (admin, kasir)
router.get("/", authorizeRoles("admin", "kasir"), getAll);

// GET  /api/vehicles/plate/:plate       → cari by plat nomor (admin, kasir)
// ⚠️ Harus sebelum /:id supaya tidak konflik
router.get("/plate/:plate", authorizeRoles("admin", "kasir"), getByPlate);

// GET  /api/vehicles/:id                → detail kendaraan (admin, kasir)
router.get("/:id", authorizeRoles("admin", "kasir"), getOne);

// GET  /api/vehicles/:id/history        → histori servis (admin, kasir)
router.get("/:id/history", authorizeRoles("admin", "kasir"), getHistory);

// POST /api/vehicles                    → daftarkan kendaraan (kasir)
router.post("/", authorizeRoles("kasir", "admin"), create);

// PUT  /api/vehicles/:id                → update kendaraan (kasir, admin)
router.put("/:id", authorizeRoles("kasir", "admin"), update);

module.exports = router;