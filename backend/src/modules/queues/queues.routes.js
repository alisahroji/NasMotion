const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/role");
const { getAll, getOne, create, updateStatus, assign, cancel } =
  require("./queues.controller");

router.use(verifyToken);

// GET    /api/queues              → semua antrean (admin, kasir, mekanik)
router.get("/", authorizeRoles("admin", "kasir", "mekanik"), getAll);

// GET    /api/queues/:id          → detail antrean (admin, kasir, mekanik)
router.get("/:id", authorizeRoles("admin", "kasir", "mekanik"), getOne);

// POST   /api/queues              → buat antrean baru (kasir)
router.post("/", authorizeRoles("kasir", "admin"), create);

// PATCH  /api/queues/:id/status   → update status (mekanik)
router.patch("/:id/status", authorizeRoles("mekanik", "admin"), updateStatus);

// PATCH  /api/queues/:id/assign   → assign mekanik (admin, kasir)
router.patch("/:id/assign", authorizeRoles("admin", "kasir"), assign);

// DELETE /api/queues/:id          → cancel antrean (admin)
router.delete("/:id", authorizeRoles("admin"), cancel);

module.exports = router;