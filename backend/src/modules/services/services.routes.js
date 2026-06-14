const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/role");
const { getAll, getOne, create, update, toggleStatus, remove } =
  require("./services.controller");

router.use(verifyToken);

// GET  /api/services               → semua layanan (semua role)
router.get("/", authorizeRoles("admin", "kasir", "mekanik"), getAll);

// GET  /api/services/:id           → detail layanan (semua role)
router.get("/:id", authorizeRoles("admin", "kasir", "mekanik"), getOne);

// POST /api/services               → tambah layanan (admin)
router.post("/", authorizeRoles("admin"), create);

// PUT  /api/services/:id           → update layanan (admin)
router.put("/:id", authorizeRoles("admin"), update);

// PATCH /api/services/:id/toggle   → aktif/nonaktifkan (admin)
router.patch("/:id/toggle", authorizeRoles("admin"), toggleStatus);

// DELETE /api/services/:id         → hapus layanan (admin)
router.delete("/:id", authorizeRoles("admin"), remove);

module.exports = router;