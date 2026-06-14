import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

/* ── Nav config per role ─────────────────────────────────────── */
const NAV = {
  admin: [
    { to: "/admin/dashboard",  label: "Dashboard",    icon: <IconDashboard /> },
    { to: "/antrian",          label: "Antrean Live", icon: <IconQueue />     },
    { to: "/admin/spareparts", label: "Sparepart",    icon: <IconBox />       },
    { to: "/admin/services",   label: "Servis",       icon: <IconWrench />    },
    { to: "/admin/users",      label: "Pengguna",     icon: <IconUsers />     },
    { to: "/admin/reports",    label: "Laporan",      icon: <IconChart />     },
  ],
  kasir: [
    { to: "/antrian",  label: "Antrean Live", icon: <IconQueue />   },
    { to: "/invoice",  label: "Invoice",      icon: <IconReceipt /> },
    { to: "/histori",  label: "Histori",      icon: <IconHistory /> },
  ],
  mekanik: [
    { to: "/antrian", label: "Antrean Live", icon: <IconQueue /> },
  ],
};

const ROLE_COLOR = { admin: "#5B8DEF", kasir: "#52C97B", mekanik: "#C8912A" };
const ROLE_LABEL = { admin: "Administrator", kasir: "Kasir", mekanik: "Mekanik" };

/* ── AppLayout ───────────────────────────────────────────────── */
export default function AppLayout() {
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();
  const location                = useLocation();
  const [open,    setOpen]      = useState(false);
  const [confirm, setConfirm]   = useState(false);
  const overlayRef              = useRef(null);

  const navItems = useMemo(() => NAV[user?.role] ?? [], [user?.role]);

  // Tutup sidebar saat route berubah (mobile)
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Tutup sidebar klik overlay
  const handleOverlay = useCallback((e) => {
    if (e.target === overlayRef.current) setOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    if (!confirm) { setConfirm(true); return; }
    try {
      await logout();
      toast.success("Berhasil logout.");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Gagal logout.");
    }
  }, [confirm, logout, navigate]);

  // Reset confirm logout jika klik di luar
  useEffect(() => {
    if (!confirm) return;
    const t = setTimeout(() => setConfirm(false), 3000);
    return () => clearTimeout(t);
  }, [confirm]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#06080D" }}>

      {/* ── Overlay Mobile ─────────────────────────────────── */}
      {open && (
        <div
          ref={overlayRef}
          onClick={handleOverlay}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(6,8,13,0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 40,
          }}
        />
      )}

      {/* ════════════════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════════════════ */}
      <aside
        style={{
          position: "fixed",
          top: 0, left: 0, bottom: 0,
          width: "240px",
          background: "#0C0F18",
          borderRight: "1px solid #1A2035",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          transform: open ? "translateX(0)" : undefined,
          transition: "transform 0.28s cubic-bezier(0.22,1,0.36,1)",
        }}
        className="sidebar-el"
      >
        {/* Sidebar top accent */}
        <div style={{
          height: "2px",
          background: "linear-gradient(to right, transparent, #C8912A 40%, transparent)",
        }} />

        {/* Logo */}
        <div style={{
          padding: "22px 20px 18px",
          borderBottom: "1px solid #1A2035",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "8px",
            background: "rgba(200,145,42,0.10)",
            border: "1px solid rgba(200,145,42,0.20)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <IconWrenchLogo />
          </div>
          <div>
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700, fontSize: "18px",
              letterSpacing: "0.06em", textTransform: "uppercase",
              color: "#CDD5E4", lineHeight: 1,
            }}>
              Nas<span style={{ color: "#C8912A" }}>Motion</span>
            </div>
            <div style={{
              fontFamily: "Barlow Semi Condensed, sans-serif",
              fontSize: "10px", letterSpacing: "0.14em",
              textTransform: "uppercase", color: "#2E3A50",
              marginTop: "2px",
            }}>
              Workshop
            </div>
          </div>

          {/* Close button mobile */}
          <button
            onClick={() => setOpen(false)}
            className="sidebar-close-btn"
            style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "#2E3A50", cursor: "pointer", padding: "4px",
              display: "none",
            }}
          >
            <IconX />
          </button>
        </div>

        {/* User card */}
        <div style={{
          margin: "14px 12px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid #1A2035",
          borderRadius: "10px",
          padding: "12px 14px",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%",
            background: `${ROLE_COLOR[user?.role]}18`,
            border: `1px solid ${ROLE_COLOR[user?.role]}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700, fontSize: "14px",
              color: ROLE_COLOR[user?.role],
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: "Barlow Semi Condensed, sans-serif",
              fontWeight: 600, fontSize: "13px",
              color: "#CDD5E4",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {user?.name}
            </div>
            <div style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: "11px", color: ROLE_COLOR[user?.role],
              marginTop: "1px",
            }}>
              {ROLE_LABEL[user?.role]}
            </div>
          </div>
        </div>

        {/* Nav label */}
        <div style={{
          padding: "4px 20px 8px",
          fontFamily: "Barlow Semi Condensed, sans-serif",
          fontSize: "10px", fontWeight: 600,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "#1E2840",
        }}>
          Menu
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "0 10px", overflowY: "auto" }}>
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px 10px 16px", borderTop: "1px solid #1A2035" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 12px",
              background: confirm ? "rgba(192,57,43,0.12)" : "transparent",
              border: confirm ? "1px solid rgba(192,57,43,0.25)" : "1px solid transparent",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              color: confirm ? "#E74C3C" : "#3A4A60",
            }}
            onMouseEnter={(e) => {
              if (!confirm) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}
            onMouseLeave={(e) => {
              if (!confirm) e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
              <IconLogout color={confirm ? "#E74C3C" : "#3A4A60"} />
            </span>
            <span style={{
              fontFamily: "Barlow Semi Condensed, sans-serif",
              fontWeight: 500, fontSize: "13px",
              letterSpacing: "0.04em",
            }}>
              {confirm ? "Konfirmasi Logout?" : "Keluar"}
            </span>
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════════════════ */}
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
        className="main-content-el"
      >
        {/* ── Topbar ──────────────────────────────────────── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          height: "58px",
          background: "rgba(11,14,22,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1A2035",
          display: "flex", alignItems: "center",
          padding: "0 20px", gap: "14px",
        }}>
          {/* Hamburger */}
          <button
            onClick={() => setOpen((p) => !p)}
            className="hamburger-btn"
            style={{
              background: "none", border: "none",
              color: "#4E5D75", cursor: "pointer",
              padding: "6px", borderRadius: "6px",
              display: "none", alignItems: "center",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C8912A")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#4E5D75")}
          >
            <IconMenu />
          </button>

          {/* Page title via location */}
          <PageTitle location={location} navItems={navItems} />

          <div style={{ flex: 1 }} />

          {/* Role badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "5px 12px",
            background: `${ROLE_COLOR[user?.role]}10`,
            border: `1px solid ${ROLE_COLOR[user?.role]}22`,
            borderRadius: "20px",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: ROLE_COLOR[user?.role],
              boxShadow: `0 0 6px ${ROLE_COLOR[user?.role]}`,
            }} />
            <span style={{
              fontFamily: "Barlow Semi Condensed, sans-serif",
              fontSize: "12px", fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: ROLE_COLOR[user?.role],
            }}>
              {ROLE_LABEL[user?.role]}
            </span>
          </div>
        </header>

        {/* ── Page content (Outlet) ─────────────────────── */}
        <main style={{
          flex: 1,
          padding: "24px",
          overflowY: "auto",
          minHeight: 0,
        }}
        className="page-main-el"
        >
          <Outlet context={{ user }} />
        </main>
      </div>

      {/* ── Responsive styles ──────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-el {
            transform: translateX(-100%) !important;
          }
          .sidebar-el.open {
            transform: translateX(0) !important;
          }
          .hamburger-btn { display: flex !important; }
          .sidebar-close-btn { display: flex !important; }
          .main-content-el { margin-left: 0 !important; }
          .page-main-el { padding: 16px !important; }
        }
        @media (min-width: 769px) {
          .sidebar-el { transform: translateX(0) !important; }
          .main-content-el { margin-left: 240px; }
        }
      `}</style>
    </div>
  );
}

/* ── NavItem (React.memo) ────────────────────────────────────── */
const NavItem = ({ to, label, icon }) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({
      display: "flex", alignItems: "center", gap: "10px",
      padding: "9px 12px",
      borderRadius: "8px",
      marginBottom: "2px",
      textDecoration: "none",
      background: isActive ? "rgba(200,145,42,0.10)" : "transparent",
      border: isActive ? "1px solid rgba(200,145,42,0.18)" : "1px solid transparent",
      color: isActive ? "#C8912A" : "#4E5D75",
      transition: "all 0.18s",
      fontFamily: "Barlow Semi Condensed, sans-serif",
      fontWeight: isActive ? 600 : 500,
      fontSize: "13px",
      letterSpacing: "0.04em",
    })}
    onMouseEnter={(e) => {
      if (!e.currentTarget.style.background.includes("rgba(200")) {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.color = "#8A9BB0";
      }
    }}
    onMouseLeave={(e) => {
      if (!e.currentTarget.style.background.includes("rgba(200")) {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#4E5D75";
      }
    }}
  >
    <span style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
      {icon}
    </span>
    {label}
  </NavLink>
);

/* ── Page Title ──────────────────────────────────────────────── */
const PageTitle = ({ location, navItems }) => {
  const current = navItems.find((n) => n.to === location.pathname);
  return (
    <span style={{
      fontFamily: "Barlow Condensed, sans-serif",
      fontWeight: 600, fontSize: "17px",
      letterSpacing: "0.04em", textTransform: "uppercase",
      color: "#CDD5E4",
    }}>
      {current?.label ?? "NasMotion"}
    </span>
  );
};

/* ── SVG Icons ───────────────────────────────────────────────── */
const ic = (d, extra = "") => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...(extra ? { style: extra } : {})}>
    {d}
  </svg>
);

function IconDashboard() { return ic(<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>); }
function IconQueue()    { return ic(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>); }
function IconBox()      { return ic(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>); }
function IconWrench()   { return ic(<><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>); }
function IconUsers()    { return ic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>); }
function IconChart()    { return ic(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>); }
function IconReceipt()  { return ic(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>); }
function IconHistory()  { return ic(<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></>); }
function IconMenu()     { return ic(<><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>); }
function IconX()        { return ic(<><line x1="18" y1="6"  x2="6"  y2="18"/><line x1="6"  y1="6"  x2="18" y2="18"/></>); }
function IconWrenchLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#C8912A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
}
function IconLogout({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}