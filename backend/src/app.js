require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pool = require("./config/db");

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
const publicRoutes    = require("./modules/public/public.routes");

app.use("/api/auth",       authRoutes);
app.use("/api/users",      userRoutes);
app.use("/api/vehicles",   vehicleRoutes);
app.use("/api/queues",     queueRoutes);
app.use("/api/repairs",    repairRoutes);
app.use("/api/spareparts", sparepartRoutes);
app.use("/api/services",   serviceRoutes);
app.use("/api/invoices",   invoiceRoutes);
app.use("/api/reports",    reportRoutes);
app.use("/api/public",     publicRoutes); // PUBLIK: cek status tanpa JWT (field aman saja)

// ─── Health Check ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "𝑵𝒂𝒔𝑴𝒐𝒕𝒊𝒐𝒏 API is running 🔧",
    version: "1.0.0",
  });
});

// ─── Health Check DB (diagnostik aman: TANPA credential) ─────
// Tidak pernah menampilkan password / connection string / secret.
app.get("/api/health", async (req, res) => {
  const started = Date.now();
  try {
    await pool.query("SELECT 1");
    return res.json({
      success: true,
      service: "nasmotion-api",
      database: {
        reachable: true,
        latency_ms: Date.now() - started,
      },
      uptime_s: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const msg = String(err.message || "");
    const code = err.code || "";
    // Kategori error saja — message mentah bisa memuat host/username DB
    const error_category =
      /tenant\/user/i.test(msg) ? "pooler_tenant_not_found (cek DATABASE_URL: PROJECT_REF / status project Supabase)" :
      code === "28P01"          ? "auth_failed (password DB salah)" :
      code === "28000"          ? "auth_failed (user/role DB tidak ada)" :
      code === "3D000"          ? "database_not_found" :
      code === "ECONNREFUSED"   ? "connection_refused" :
      code === "ETIMEDOUT"      ? "connection_timeout" :
      code === "ENOTFOUND"      ? "dns_host_not_found (host DATABASE_URL salah)" :
                                  "unknown (lihat log server)";
    console.error("❌ Health check DB:", code || "", msg.replace(/postgres\.[a-z0-9]+/gi, "postgres.<ref>"));
    return res.status(503).json({
      success: false,
      service: "nasmotion-api",
      database: {
        reachable: false,
        error_category,
      },
      uptime_s: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }
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
// Parsing PORT yang robust: "", "0", atau non-numerik → fallback 5000.
// (PORT="0" truthy string menyebabkan server bind ke port acak.)
const PORT_CANDIDATE = Number(process.env.PORT);
const PORT = Number.isInteger(PORT_CANDIDATE) && PORT_CANDIDATE > 0 ? PORT_CANDIDATE : 5000;
app.listen(PORT, () => {
  console.log(`🚀 NasMotion API running on http://localhost:${PORT}`);
});

module.exports = app;