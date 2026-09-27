const express = require("express");
const router = express.Router();
const { trackByPlate } = require("./public.controller");

// GET /api/public/vehicles/status/:plate
// PUBLIK: tanpa JWT, tanpa role — hanya mengembalikan field aman.
// Endpoint internal /api/vehicles/plate/:plate TETAP terproteksi.
router.get("/vehicles/status/:plate", trackByPlate);

module.exports = router;
