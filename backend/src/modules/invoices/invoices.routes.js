const express = require("express");
const router = express.Router();
const verifyToken = require("../../middlewares/auth");
const authorizeRoles = require("../../middlewares/role");
const { getAll, getOne, create, pay } = require("./invoices.controller");

router.use(verifyToken);

// GET   /api/invoices             → semua invoice (admin, kasir)
router.get("/", authorizeRoles("admin", "kasir"), getAll);

// GET   /api/invoices/:id         → detail invoice (admin, kasir)
router.get("/:id", authorizeRoles("admin", "kasir"), getOne);

// POST  /api/invoices             → buat invoice (kasir)
router.post("/", authorizeRoles("kasir", "admin"), create);

// PATCH /api/invoices/:id/pay     → tandai lunas (kasir)
router.patch("/:id/pay", authorizeRoles("kasir", "admin"), pay);

module.exports = router;