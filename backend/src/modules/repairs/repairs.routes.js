const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/role");
const { getByQueue, addSparepart, updateSparepart, removeSparepart } =
  require("./repairs.controller");

router.use(verifyToken);

// GET    /api/repairs/:queue_id                  → lihat sparepart dipakai (semua role)
router.get("/:queue_id", authorizeRoles("admin", "kasir", "mekanik"), getByQueue);

// POST   /api/repairs/:queue_id/spareparts       → tambah sparepart (mekanik)
router.post("/:queue_id/spareparts", authorizeRoles("mekanik", "admin"), addSparepart);

// PATCH  /api/repairs/spareparts/:id             → update qty (mekanik)
router.patch("/spareparts/:id", authorizeRoles("mekanik", "admin"), updateSparepart);

// DELETE /api/repairs/spareparts/:id             → hapus sparepart (mekanik)
router.delete("/spareparts/:id", authorizeRoles("mekanik", "admin"), removeSparepart);

module.exports = router;