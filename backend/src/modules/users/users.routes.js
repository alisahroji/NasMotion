const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/role");
const {
  getAll, getOne, create, update, toggleStatus, remove,
} = require("./users.controller");
const pool = require("../../config/db");

// ── KHUSUS: GET mechanics — bisa diakses kasir & mekanik ─────
// Harus di atas middleware admin supaya tidak ke-block
router.get(
  "/mechanics",
  verifyToken,
  authorizeRoles("admin", "kasir", "mekanik"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, name, email
         FROM users
         WHERE role = 'mekanik' AND is_active = true
         ORDER BY name ASC`
      );
      return res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      console.error("Get mechanics error:", err.message);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
  }
);

// ── Semua route di bawah ini hanya admin ─────────────────────
router.use(verifyToken, authorizeRoles("admin"));

router.get("/",            getAll);
router.get("/:id",         getOne);
router.post("/",           create);
router.put("/:id",         update);
router.patch("/:id/toggle-status", toggleStatus);
router.delete("/:id",      remove);

module.exports = router;
