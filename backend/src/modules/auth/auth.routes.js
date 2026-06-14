const express = require("express");
const router = express.Router();
const { login, logout, getMe } = require("./auth.controller");
const verifyToken = require("../../middlewares/auth");

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/logout
router.post("/logout", verifyToken, logout);

// GET /api/auth/me
router.get("/me", verifyToken, getMe);

module.exports = router;
