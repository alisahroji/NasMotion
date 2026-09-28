import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// ── Public pages diimport langsung (bukan lazy) ─────────────
// supaya tidak ada flicker/loading saat pertama buka
import Login     from "./pages/auth/Login";
import CekStatus from "./pages/public/CekStatus";
import Landing   from "./pages/public/Landing";

// ── Lazy load semua halaman protected ────────────────────────
const AppLayout      = lazy(() => import("./components/layout/AppLayout"));
const Dashboard      = lazy(() => import("./pages/admin/Dashboard"));
const Spareparts     = lazy(() => import("./pages/admin/Spareparts"));
const Services       = lazy(() => import("./pages/admin/Services"));
const Users          = lazy(() => import("./pages/admin/Users"));
const Reports        = lazy(() => import("./pages/admin/Reports"));
const QueueLive      = lazy(() => import("./pages/shared/QueueLive"));
const RepairDetail   = lazy(() => import("./pages/shared/RepairDetail"));
const VehicleHistory = lazy(() => import("./pages/shared/VehicleHistory"));
const Invoice        = lazy(() => import("./pages/kasir/Invoice"));

const PageLoader = () => (
  <div style={{
    height: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
    background: "#06080D",
  }}>
    <div style={{
      width: 36, height: 36,
      border: "2px solid #1A2035",
      borderTop: "2px solid #C8912A",
      borderRadius: "50%",
      animation: "spinSlow 0.8s linear infinite",
    }} />
  </div>
);

// ── Document title global (fallback; halaman spesifik meng-override sendiri) ──
const PAGE_TITLES = {
  "/login":          "NasMotion — Login",
  "/cek":            "NasMotion — Cek Status",
  "/antrian":        "NasMotion — Antrean",
  "/histori":        "NasMotion — Histori",
  "/invoice":        "NasMotion — Invoice",
  "/admin/dashboard":  "NasMotion — Dashboard",
  "/admin/spareparts": "NasMotion — Sparepart",
  "/admin/services":   "NasMotion — Servis",
  "/admin/users":      "NasMotion — Pengguna",
  "/admin/reports":    "NasMotion — Laporan",
};

// ── Default route per role ────────────────────────────────────
const defaultRoute = (role) =>
  ({ admin: "/admin/dashboard", kasir: "/antrian", mekanik: "/antrian" }[role] ?? "/login");

// ── Route Guard ───────────────────────────────────────────────
const Guard = ({ roles, children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to={defaultRoute(user.role)} replace />;
  return children;
};

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Dynamic document title per halaman
  useEffect(() => {
    document.title = PAGE_TITLES[location.pathname] ?? "NasMotion — Workshop Management System";
  }, [location.pathname]);

  if (loading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── PUBLIC (tanpa login) ─────────────────────────── */}
        <Route path="/" element={<Landing />} />
        <Route path="/cek" element={<CekStatus />} />

        <Route
          path="/login"
          element={user ? <Navigate to={defaultRoute(user.role)} replace /> : <Login />}
        />

        {/* ── PROTECTED (perlu login + AppLayout) ─────────── */}
        {/* Pathless layout: URL nested tidak berubah, "/" milik landing */}
        <Route element={<Guard><AppLayout /></Guard>}>

          {/* Admin */}
          <Route path="admin/dashboard"
            element={<Guard roles={["admin"]}><Dashboard /></Guard>} />
          <Route path="admin/spareparts"
            element={<Guard roles={["admin"]}><Spareparts /></Guard>} />
          <Route path="admin/services"
            element={<Guard roles={["admin"]}><Services /></Guard>} />
          <Route path="admin/users"
            element={<Guard roles={["admin"]}><Users /></Guard>} />
          <Route path="admin/reports"
            element={<Guard roles={["admin"]}><Reports /></Guard>} />

          {/* Shared */}
          <Route path="antrian"
            element={<Guard roles={["admin","kasir","mekanik"]}><QueueLive /></Guard>} />
          <Route path="perbaikan/:id"
            element={<Guard roles={["admin","kasir","mekanik"]}><RepairDetail /></Guard>} />
          <Route path="histori"
            element={<Guard roles={["admin","kasir"]}><VehicleHistory /></Guard>} />

          {/* Kasir */}
          <Route path="invoice"
            element={<Guard roles={["kasir","admin"]}><Invoice /></Guard>} />
          {/* "/" tidak lagi index redirect — landing publik di route "/" terpisah */}
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Suspense>
  );
}