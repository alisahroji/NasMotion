const express = require("express");
const router = express.Router();
const { login, logout, getMe } = require("./auth.controller");
const verifyToken = require("../../middlewares/auth");

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/logout
// Logout adalah operasi cleanup/session termination: cookie harus selalu
// di-clear meski token expired/tidak ada. Token TIDAK diverifikasi di sini —
// aman karena endpoint ini tidak mengembalikan data apa pun.
router.post("/logout", logout);

// GET /api/auth/me
router.get("/me", verifyToken, getMe);

module.exports = router;
