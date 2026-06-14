import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// ── Login diimport langsung (bukan lazy) supaya tidak flicker ─
import Login from "./pages/auth/Login";

// ── Lazy load semua halaman ───────────────────────────────────
const AppLayout      = lazy(() => import("./components/layout/AppLayout"));

// Admin
const Dashboard      = lazy(() => import("./pages/admin/Dashboard"));
const Spareparts     = lazy(() => import("./pages/admin/Spareparts"));
const Services       = lazy(() => import("./pages/admin/Services"));
const Users          = lazy(() => import("./pages/admin/Users"));
const Reports        = lazy(() => import("./pages/admin/Reports"));

// Shared (Admin + Kasir + Mekanik)
const QueueLive      = lazy(() => import("./pages/shared/QueueLive"));
const RepairDetail   = lazy(() => import("./pages/shared/RepairDetail"));
const VehicleHistory = lazy(() => import("./pages/shared/VehicleHistory"));

// Kasir
const Invoice        = lazy(() => import("./pages/kasir/Invoice"));

// ── Page Loader ───────────────────────────────────────────────
const PageLoader = () => (
  <div
    style={{
      height: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#06080D",
    }}
  >
    <div
      style={{
        width: 36, height: 36,
        border: "2px solid #1A2035",
        borderTop: "2px solid #C8912A",
        borderRadius: "50%",
        animation: "spinSlow 0.8s linear infinite",
      }}
    />
  </div>
);

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
  if (loading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Public ───────────────────────────────────────── */}
        <Route
          path="/login"
          element={user ? <Navigate to={defaultRoute(user.role)} replace /> : <Login />}
        />

        {/* ── Protected (semua dalam AppLayout + Outlet) ───── */}
        <Route path="/" element={<Guard><AppLayout /></Guard>}>

          {/* Admin only */}
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

          {/* Shared — Admin, Kasir, Mekanik */}
          <Route path="antrian"
            element={<Guard roles={["admin","kasir","mekanik"]}><QueueLive /></Guard>} />
          <Route path="perbaikan/:id"
            element={<Guard roles={["admin","kasir","mekanik"]}><RepairDetail /></Guard>} />
          <Route path="histori"
            element={<Guard roles={["admin","kasir"]}><VehicleHistory /></Guard>} />

          {/* Kasir */}
          <Route path="invoice"
            element={<Guard roles={["kasir","admin"]}><Invoice /></Guard>} />

          {/* Default redirect ke halaman sesuai role */}
          <Route index element={<Navigate to={defaultRoute(user?.role)} replace />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Suspense>
  );
}