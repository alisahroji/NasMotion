const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/role");
const { getAll, getOne, getLowStock, create, update, updateStock, remove } =
  require("./spareparts.controller");

router.use(verifyToken);

// GET  /api/spareparts/low-stock       → sparepart hampir habis (admin)
// ⚠️ Harus sebelum /:id
router.get("/low-stock", authorizeRoles("admin"), getLowStock);

// GET  /api/spareparts                 → semua sparepart (semua role)
router.get("/", authorizeRoles("admin", "kasir", "mekanik"), getAll);

// GET  /api/spareparts/:id             → detail sparepart (semua role)
router.get("/:id", authorizeRoles("admin", "kasir", "mekanik"), getOne);

// POST /api/spareparts                 → tambah sparepart (admin)
router.post("/", authorizeRoles("admin"), create);

// PUT  /api/spareparts/:id             → update sparepart (admin)
router.put("/:id", authorizeRoles("admin"), update);

// PATCH /api/spareparts/:id/stock      → update stok saja (admin)
router.patch("/:id/stock", authorizeRoles("admin"), updateStock);

// DELETE /api/spareparts/:id           → hapus sparepart (admin)
router.delete("/:id", authorizeRoles("admin"), remove);

module.exports = router;