require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// ─── Middleware Global ────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // penting untuk cookie JWT
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────────
const authRoutes      = require("./modules/auth/auth.routes");
const userRoutes      = require("./modules/users/users.routes");
const vehicleRoutes   = require("./modules/vehicles/vehicles.routes");
const queueRoutes     = require("./modules/queues/queues.routes");
const repairRoutes    = require("./modules/repairs/repairs.routes");
const sparepartRoutes = require("./modules/spareparts/spareparts.routes");
const serviceRoutes   = require("./modules/services/services.routes");
const invoiceRoutes   = require("./modules/invoices/invoices.routes");
const reportRoutes    = require("./modules/reports/reports.routes");

app.use("/api/auth",       authRoutes);
app.use("/api/users",      userRoutes);
app.use("/api/vehicles",   vehicleRoutes);
app.use("/api/queues",     queueRoutes);
app.use("/api/repairs",    repairRoutes);
app.use("/api/spareparts", sparepartRoutes);
app.use("/api/services",   serviceRoutes);
app.use("/api/invoices",   invoiceRoutes);
app.use("/api/reports",    reportRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "𝑵𝒂𝒔𝑴𝒐𝒕𝒊𝒐𝒏 API is running 🔧",
    version: "1.0.0",
  });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 NasMotion API running on http://localhost:${PORT}`);
});