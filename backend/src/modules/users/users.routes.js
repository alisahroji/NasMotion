const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/role");
const {
  getAll,
  getOne,
  create,
  update,
  toggleStatus,
  remove,
} = require("./users.controller");

// Semua route users hanya bisa diakses admin
router.use(verifyToken, authorizeRoles("admin"));

// GET    /api/users              → semua user (filter: ?role=mekanik&is_active=true)
router.get("/", getAll);

// GET    /api/users/:id          → detail user
router.get("/:id", getOne);

// POST   /api/users              → buat akun kasir/mekanik
router.post("/", create);

// PUT    /api/users/:id          → update user
router.put("/:id", update);

// PATCH  /api/users/:id/toggle-status → aktif/nonaktifkan user
router.patch("/:id/toggle-status", toggleStatus);

// DELETE /api/users/:id          → hapus permanen
router.delete("/:id", remove);

module.exports = router;
