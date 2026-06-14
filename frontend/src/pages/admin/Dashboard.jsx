import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import api from "../../utils/api";

// ── Helpers ───────────────────────────────────────────────────
const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const fmtDate = (s) => {
  if (!s) return "-";
  return new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
};

const STATUS = {
  waiting:     { label: "Menunggu",   color: "#5B8DEF", bg: "rgba(91,141,239,0.12)"  },
  in_progress: { label: "Dikerjakan", color: "#C8912A", bg: "rgba(200,145,42,0.12)"  },
  done:        { label: "Selesai",    color: "#52C97B", bg: "rgba(82,201,123,0.12)"   },
  cancelled:   { label: "Batal",      color: "#E74C3C", bg: "rgba(231,76,60,0.12)"    },
};

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = memo(({ label, value, sub, icon, accent, loading }) => (
  <div style={{
    background: "#0C0F18", border: "1px solid #1A2035",
    borderTop: `2px solid ${accent}`, borderRadius: "12px",
    padding: "20px 22px", position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: -20, right: -20,
      width: 100, height: 100, borderRadius: "50%",
      background: `radial-gradient(circle, ${accent}08 0%, transparent 70%)`,
      pointerEvents: "none",
    }} />
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
      <span style={{
        fontFamily: "Barlow Semi Condensed, sans-serif",
        fontSize: 11, fontWeight: 600,
        letterSpacing: "0.16em", textTransform: "uppercase", color: "#4E5D75",
      }}>{label}</span>
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: `${accent}15`, border: `1px solid ${accent}25`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{icon}</div>
    </div>
    {loading ? (
      <div style={{ height: 30, width: "55%", background: "#161C2A", borderRadius: 6 }} />
    ) : (
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700, fontSize: 28, color: "#CDD5E4",
        letterSpacing: "0.02em", lineHeight: 1,
      }}>{value}</div>
    )}
    {sub && !loading && (
      <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#4E5D75", marginTop: 6 }}>
        {sub}
      </div>
    )}
  </div>
));
StatCard.displayName = "StatCard";

// ── Status Badge ──────────────────────────────────────────────
const StatusBadge = memo(({ status }) => {
  const cfg = STATUS[status] ?? { label: status, color: "#4E5D75", bg: "rgba(78,93,117,0.12)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, border: `1px solid ${cfg.color}30`,
      borderRadius: 20, padding: "3px 10px",
      fontFamily: "Barlow Semi Condensed, sans-serif",
      fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: cfg.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color }} />
      {cfg.label}
    </span>
  );
});
StatusBadge.displayName = "StatusBadge";

// ── Chart Tooltip ─────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#111520", border: "1px solid #1A2035",
      borderRadius: 8, padding: "10px 14px",
    }}>
      <p style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: "#4E5D75", marginBottom: 6 }}>
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.name} style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, color: p.color, marginBottom: 2 }}>
          {p.name === "total" ? "Total" : "Selesai"}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────
const Skeleton = ({ h = 44, mb = 8 }) => (
  <div style={{ height: h, background: "#111520", borderRadius: 8, marginBottom: mb }} />
);

// ── Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
  const [stats,       setStats]       = useState(null);
  const [lowStock,    setLowStock]    = useState([]);
  const [queues,      setQueues]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // 🔴 JAM REAL + DETIK (diambil dari konsep dashboard pertama)
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, lowRes, queueRes] = await Promise.all([
        api.get("/reports/dashboard"),
        api.get("/spareparts/low-stock"),
        api.get("/queues"),
      ]);
      setStats(statsRes.data.data);
      setLowStock(lowRes.data.data.slice(0, 5));
      setQueues(queueRes.data.data.slice(0, 8));
      setLastUpdated(new Date());
    } catch {
      toast.error("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const chartData = useMemo(() =>
    (stats?.queue_chart ?? []).map((item) => ({
      date:    fmtDate(item.date),
      total:   parseInt(item.total)     || 0,
      selesai: parseInt(item.completed) || 0,
    })),
  [stats]);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Format jam dengan detik (HH:MM:SS)
  const formattedTime = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  return (
    <div style={{ maxWidth: 1400 }}>

      {/* Header dengan jam real + detik */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: "0.04em", textTransform: "uppercase", color: "#CDD5E4", marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "#4E5D75" }}>{today}</p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* JAM REAL DENGAN DETIK */}
          <div style={{
            background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 12,
            padding: "6px 16px", fontFamily: "Barlow Condensed, sans-serif",
            fontSize: 20, fontWeight: 700, letterSpacing: "0.04em",
            color: "#C8912A", textShadow: "0 0 4px rgba(200,145,42,0.3)",
          }}>
            {formattedTime}
          </div>
          
          <button onClick={fetchAll} disabled={loading} style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "rgba(200,145,42,0.08)", border: "1px solid rgba(200,145,42,0.20)",
            borderRadius: 8, padding: "8px 14px", color: "#C8912A", cursor: "pointer",
            fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s",
          }}>
            <IcRefresh spin={loading} /> Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards (sama seperti dashboard kedua) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Antrean Hari Ini"    value={stats?.queue_today?.total ?? "—"}           sub={`${stats?.queue_today?.waiting ?? 0} menunggu`}            accent="#5B8DEF" loading={loading} icon={<IcList   c="#5B8DEF" />} />
        <StatCard label="Sedang Dikerjakan"   value={stats?.queue_today?.in_progress ?? "—"}     sub={`${stats?.queue_today?.done ?? 0} selesai hari ini`}        accent="#C8912A" loading={loading} icon={<IcWrench c="#C8912A" />} />
        <StatCard label="Pendapatan Hari Ini" value={loading ? "—" : formatRp(stats?.revenue?.today)}                                                            accent="#52C97B" loading={loading} icon={<IcMoney  c="#52C97B" />} />
        <StatCard label="Pendapatan Bulan Ini" value={loading ? "—" : formatRp(stats?.revenue?.this_month)} sub={`${stats?.active_mechanics ?? 0} mekanik aktif`} accent="#A78BFA" loading={loading} icon={<IcChart  c="#A78BFA" />} />
      </div>

      {/* Middle grid: Chart + Low Stock (sama seperti dashboard kedua) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, marginBottom: 16 }} className="dash-mid">

        {/* Chart */}
        <div style={{ background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 12, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: "0.06em", textTransform: "uppercase", color: "#CDD5E4", marginBottom: 2 }}>
                Aktivitas Antrean
              </h2>
              <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#4E5D75" }}>7 hari terakhir</p>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[{ c: "#C8912A", l: "Total" }, { c: "#52C97B", l: "Selesai" }].map((x) => (
                <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: x.c }} />
                  <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: "#4E5D75" }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>
          {loading ? <Skeleton h={200} mb={0} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gTotal"  x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C8912A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#C8912A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSelesai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#52C97B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#52C97B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2035" vertical={false} />
                <XAxis dataKey="date"   tick={{ fill: "#4E5D75", fontSize: 11, fontFamily: "Barlow Semi Condensed" }} axisLine={false} tickLine={false} />
                <YAxis                  tick={{ fill: "#4E5D75", fontSize: 11, fontFamily: "Barlow Semi Condensed" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="total"   stroke="#C8912A" strokeWidth={2} fill="url(#gTotal)"   dot={false} />
                <Area type="monotone" dataKey="selesai" stroke="#52C97B" strokeWidth={2} fill="url(#gSelesai)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Low Stock - Tabel stok menipis */}
        <div style={{ background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 12, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: (stats?.low_stock_count ?? 0) > 0 ? "#E74C3C" : "#52C97B",
              boxShadow: (stats?.low_stock_count ?? 0) > 0 ? "0 0 8px rgba(231,76,60,0.6)" : "none",
              animation: (stats?.low_stock_count ?? 0) > 0 ? "pulseGlow 2s ease-in-out infinite" : "none",
            }} />
            <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", color: "#CDD5E4", flex: 1 }}>
              Stok Menipis
            </h2>
            {(stats?.low_stock_count ?? 0) > 0 && (
              <span style={{ background: "rgba(231,76,60,0.12)", border: "1px solid rgba(231,76,60,0.25)", borderRadius: 10, padding: "2px 8px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, color: "#E74C3C", fontWeight: 700 }}>
                {stats.low_stock_count}
              </span>
            )}
          </div>
          {loading ? (
            [1,2,3].map((i) => <Skeleton key={i} h={50} mb={8} />)
          ) : lowStock.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#4E5D75", fontFamily: "Barlow, sans-serif", fontSize: 13 }}>
              ✓ Semua stok aman
            </div>
          ) : lowStock.map((item) => (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(231,76,60,0.04)", border: "1px solid rgba(231,76,60,0.12)",
              borderRadius: 8, padding: "10px 12px", marginBottom: 8,
            }}>
              <div>
                <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 13, color: "#CDD5E4", fontWeight: 500 }}>{item.name}</div>
                <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 11, color: "#4E5D75" }}>Min: {item.min_stock} {item.unit}</div>
              </div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 18, color: "#E74C3C" }}>
                {item.stock}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Queues - Tabel antrean terkini */}
      <div style={{ background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 12, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: "0.06em", textTransform: "uppercase", color: "#CDD5E4" }}>
            Antrean Terkini
          </h2>
          {lastUpdated && (
            <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 11, color: "#2E3A50" }}>
              Update: {lastUpdated.toLocaleTimeString("id-ID")}
            </span>
          )}
        </div>
        {loading ? (
          [1,2,3,4].map((i) => <Skeleton key={i} h={48} mb={6} />)
        ) : queues.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#4E5D75", fontFamily: "Barlow, sans-serif", fontSize: 14 }}>
            Belum ada antrean
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["No","Plat","Pemilik","Kendaraan","Keluhan","Mekanik","Status"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2E3A50", textAlign: "left", borderBottom: "1px solid #1A2035" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queues.map((q) => (
                  <tr key={q.id} style={{ borderBottom: "1px solid #0F1218", cursor: "default" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#111520")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, color: "#4E5D75" }}>
                      #{String(q.queue_number).padStart(2,"0")}
                    </td>
                    <td style={{ padding: "12px", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 13, fontWeight: 600, color: "#CDD5E4" }}>
                      {q.plate_number}
                    </td>
                    <td style={{ padding: "12px", fontFamily: "Barlow, sans-serif", fontSize: 13, color: "#8A9BB0" }}>
                      {q.owner_name}
                    </td>
                    <td style={{ padding: "12px", fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#8A9BB0" }}>
                      {q.vehicle_brand} {q.vehicle_type}
                    </td>
                    <td style={{ padding: "12px", fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#8A9BB0", maxWidth: 160 }}>
                      <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {q.complaint}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#4E5D75" }}>
                      {q.mekanik_name ?? <span style={{ color: "#2E3A50" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <StatusBadge status={q.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(231,76,60,0.6); }
          50% { opacity: 0.6; box-shadow: 0 0 12px rgba(231,76,60,0.9); }
        }
        @media (max-width: 900px) { .dash-mid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

// ── Icons (sama persis dengan dashboard kedua) ────────────────
const IcRefresh = ({ spin }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: spin ? "spinSlow 0.8s linear infinite" : "none" }}>
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    <style>{`@keyframes spinSlow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </svg>
);
const IcList   = ({ c }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IcWrench = ({ c }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const IcMoney  = ({ c }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IcChart  = ({ c }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;