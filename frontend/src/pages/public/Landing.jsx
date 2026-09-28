import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════
   NasMotion — Premium Product Landing (STEP 19 rework of STEP 17)
   Product UI = hero. Dark charcoal + amber + Barlow Condensed.
   Semua preview UI faithful terhadap aplikasi aktual;
   data di dalam preview adalah visual demo (ditandai di halaman).
   ═══════════════════════════════════════════════════════════════ */

// Foto workshop signature aplikasi (sama dengan CekStatus/QueueLive), disimpan lokal
// agar deployment tidak bergantung pada remote URL saat runtime.
const HERO_BG = "/img/workshop-hero.jpg";

/* ── Icons (stroke 1.8, konsisten dengan icon set aplikasi) ──── */
const IcLogo = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#C8912A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const IcCar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IcQueue = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const IcUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IcWrench = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const IcBox = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IcReceipt = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IcHistory = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
  </svg>
);
const IcMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const IcX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IcArrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IcCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcClock = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

/* ── Data ─────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { id: "home",          href: "#home",          label: "Home" },
  { id: "problem",       href: "#problem",       label: "Masalah" },
  { id: "workflow",      href: "#workflow",      label: "Workflow" },
  { id: "showcase",      href: "#showcase",      label: "Product" },
  { id: "roles",         href: "#roles",         label: "Roles" },
  { id: "public-status", href: "#public-status", label: "Cek Status" },
];

const WORKFLOW = [
  { num: "01", title: "Vehicle",    icon: <IcCar />,     desc: "Data kendaraan & keluhan dicatat di front desk." },
  { num: "02", title: "Queue",      icon: <IcQueue />,   desc: "Antrean otomatis dengan nomor & status live." },
  { num: "03", title: "Mechanic",   icon: <IcUser />,    desc: "Pekerjaan di-assign ke mekanik yang tersedia." },
  { num: "04", title: "Repair",     icon: <IcWrench />,  desc: "Progress perbaikan tercatat sampai selesai." },
  { num: "05", title: "Spareparts", icon: <IcBox />,     desc: "Pemakaian sparepart terhubung ke stok." },
  { num: "06", title: "Invoice",    icon: <IcReceipt />, desc: "Invoice tersusun dari jasa + sparepart." },
  { num: "07", title: "History",    icon: <IcHistory />, desc: "Riwayat kendaraan tersimpan untuk servis berikutnya." },
];

const ROLES = [
  {
    name: "Admin", color: "#5B8DEF",
    tag: "Full control",
    items: ["Users & roles", "Katalog servis", "Inventory sparepart", "Laporan performa"],
  },
  {
    name: "Kasir", color: "#52C97B",
    tag: "Front desk",
    items: ["Antrean & pendaftaran", "Invoice & pembayaran", "Cetak invoice", "Histori kendaraan"],
  },
  {
    name: "Mekanik", color: "#C8912A",
    tag: "Workshop floor",
    items: ["Antrean yang di-assign", "Progress perbaikan", "Pemakaian sparepart", "Update status servis"],
  },
];

const TECHS = ["React", "Express", "PostgreSQL", "REST API", "JWT", "RBAC", "Supabase", "Vercel"];

const CHAOS = ["Kendaraan masuk", "Antrean menumpuk", "Multi-job mekanik", "Sparepart bergerak", "Invoice menunggu", "Histori terpisah"];

/* ── Reveal on scroll ─────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) { en.target.classList.add("in-view"); io.unobserve(en.target); }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ═══════════════════════════════════════════════════════════════
   Product preview panels — faithful ke UI aktual (data demo)
   ═══════════════════════════════════════════════════════════════ */

const StBadge = ({ label, color, pulse }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${color}14`, border: `1px solid ${color}35`, borderRadius: 20, padding: "3px 10px", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", color, whiteSpace: "nowrap" }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, animation: pulse ? "pulseGlow 2s ease-in-out infinite" : "none" }} />
    {label}
  </span>
);

const DemoNote = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, justifyContent: "center" }}>
    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#1A2035" }} />
    <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2E3A50" }}>
      {children}
    </span>
  </div>
);

const PanelChrome = ({ title, children, pad = 18 }) => (
  <div className="lp-panel" style={{ background: "#0C0F18", border: "1px solid #1A2035", borderTop: "2px solid #C8912A", borderRadius: 14, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.55)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderBottom: "1px solid #1A2035", background: "#08090D" }}>
      {["#E74C3C", "#C8912A", "#52C97B"].map((c) => <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.5 }} />)}
      <span style={{ marginLeft: 8, fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2E3A50" }}>{title}</span>
    </div>
    <div style={{ padding: pad }}>{children}</div>
  </div>
);

/* — Antrean Live (hero) — baris kartu gaya QueueCard aktual — */
const HeroQueuePanel = () => (
  <PanelChrome title="NasMotion — Antrean Live">
    {/* Mini stat */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
      {[
        { l: "Menunggu",   v: "1", c: "#5B8DEF" },
        { l: "Dikerjakan", v: "1", c: "#C8912A" },
        { l: "Selesai",    v: "1", c: "#52C97B" },
      ].map((s) => (
        <div key={s.l} style={{ background: "#111520", border: "1px solid #1A2035", borderTop: `2px solid ${s.c}`, borderRadius: 9, padding: "9px 12px" }}>
          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 8.5, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#4E5D75", marginBottom: 4 }}>{s.l}</div>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 22, color: "#CDD5E4", lineHeight: 1 }}>{s.v}</div>
        </div>
      ))}
    </div>

    {/* Baris antrean — struktur mengikuti QueueCard aktual */}
    {[
      { no: "014", plate: "B 1879 KTA", brand: "Toyota Avanza",   job: "Ganti oli + servis rutin", mekanik: "Suryo",   st: "Dikerjakan", c: "#C8912A", pulse: true,  time: "24m", inv: false },
      { no: "015", plate: "D 5210 XYZ", brand: "Honda Brio",      job: "Pemeriksaan mesin",        mekanik: null,      st: "Menunggu",   c: "#5B8DEF", pulse: false, time: null,  inv: false },
      { no: "016", plate: "L 9034 MN",  brand: "Mitsubishi Xpander", job: "Servis rem & kampas",   mekanik: "Doni",    st: "Selesai",    c: "#52C97B", pulse: false, time: null,  inv: true },
    ].map((r) => (
      <div key={r.no} style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 13px", background: "rgba(255,255,255,0.02)", border: "1px solid #111520", borderRadius: 10, marginBottom: 8 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 26, color: "#fff", minWidth: 40, lineHeight: 1, textShadow: `0 0 18px ${r.c}66` }}>
          {r.no}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 15, color: "#CDD5E4", letterSpacing: "0.06em" }}>{r.plate}</span>
            <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: "#4E5D75" }}>{r.brand}</span>
          </div>
          <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 11, color: "#4E5D75", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {r.job}{r.mekanik ? <> · <span style={{ color: "#8A9BB0" }}>Mekanik: {r.mekanik}</span></> : null}
          </div>
        </div>
        {r.time && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#4E5D75", flexShrink: 0, fontFamily: "Barlow Condensed, sans-serif", fontSize: 12 }}>
            <IcClock />{r.time}
          </span>
        )}
        {r.inv && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(82,201,123,0.08)", border: "1px solid rgba(82,201,123,0.2)", borderRadius: 20, padding: "2px 8px", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, fontWeight: 600, color: "#52C97B", flexShrink: 0 }}>
            <IcCheck />Invoice
          </span>
        )}
        <StBadge label={r.st} color={r.c} pulse={r.pulse} />
      </div>
    ))}

    {/* Footer strip */}
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 4, paddingTop: 10, borderTop: "1px solid #111520" }}>
      {[
        { l: "Mekanik aktif",   v: "4"  },
        { l: "Antrean terbuka", v: "12" },
      ].map((s) => (
        <span key={s.l} style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 17, color: "#CDD5E4" }}>{s.v}</span>
          <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2E3A50" }}>{s.l}</span>
        </span>
      ))}
      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#52C97B", animation: "pulseGlow 2s ease-in-out infinite" }} />
        <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#52C97B", letterSpacing: "0.12em", textTransform: "uppercase" }}>Live</span>
      </span>
    </div>
  </PanelChrome>
);

/* — Repair + Sparepart panel (gaya RepairDetail aktual) — */
const RepairPanel = () => (
  <PanelChrome title="NasMotion — Detail Perbaikan">
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 18, color: "#CDD5E4", letterSpacing: "0.04em" }}>
          #014 — B 1879 KTA
        </div>
        <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 11.5, color: "#4E5D75" }}>Toyota Avanza · Ganti oli + servis rutin</div>
      </div>
      <StBadge label="Dikerjakan" color="#C8912A" pulse />
    </div>

    <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#2E3A50", margin: "12px 0 6px" }}>Jasa Servis</div>
    {[
      { n: "Ganti oli mesin",  p: "Rp 75.000" },
      { n: "Tune up",          p: "Rp 60.000" },
    ].map((s) => (
      <div key={s.n} style={{ display: "flex", justifyContent: "space-between", padding: "8px 11px", background: "rgba(255,255,255,0.02)", border: "1px solid #111520", borderRadius: 8, marginBottom: 5, fontFamily: "Barlow, sans-serif", fontSize: 12 }}>
        <span style={{ color: "#8A9BB0", display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ color: "#52C97B", display: "inline-flex" }}><IcCheck /></span>{s.n}</span>
        <span style={{ color: "#4E5D75" }}>{s.p}</span>
      </div>
    ))}

    <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#2E3A50", margin: "12px 0 6px" }}>Sparepart Dipakai</div>
    {[
      { n: "Oli Motul 10W-40 · 1 L", q: "1", stok: "Stok 24 → 23" },
      { n: "Filter oli",             q: "1", stok: "Stok 15 → 14" },
    ].map((s) => (
      <div key={s.n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 11px", background: "rgba(167,139,250,0.04)", border: "1px solid #161C2A", borderRadius: 8, marginBottom: 5 }}>
        <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#8A9BB0" }}>{s.n}</span>
        <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10.5, color: "#2E3A50" }}>×{s.q} · {s.stok}</span>
      </div>
    ))}

    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C8912A" }} />
      <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 10.5, color: "#2E3A50" }}>Stok terpotong otomatis saat sparepart dipakai — konsisten lewat trigger database.</span>
    </div>
  </PanelChrome>
);

/* — Invoice panel (gaya PrintInvoice aktual: putih) — */
const InvoicePanel = () => (
  <PanelChrome title="NasMotion — Invoice">
    <div style={{ background: "#fff", borderRadius: 10, padding: "18px 20px", color: "#1a1a2e", fontFamily: "Arial, sans-serif" }}>
      <div style={{ textAlign: "center", borderBottom: "2px solid #C8912A", paddingBottom: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>NasMotion</div>
        <div style={{ fontSize: 9, color: "#666", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>Nasution Workshop</div>
        <div style={{ fontSize: 11, color: "#C8912A", fontWeight: 700, marginTop: 6 }}>INV-20260927-004</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 10.5, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: 1.2, color: "#888", fontWeight: 700, marginBottom: 3 }}>Kendaraan</div>
          <div style={{ fontWeight: 700, fontSize: 12.5, letterSpacing: 0.5 }}>B 1879 KTA</div>
          <div style={{ color: "#555" }}>Toyota Avanza (2021)</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#fff3e0", color: "#e65100" }}>BELUM LUNAS</span>
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: "5px 7px", fontSize: 9.5, textAlign: "left", borderBottom: "1px solid #ddd", textTransform: "uppercase" }}>Layanan</th>
            <th style={{ padding: "5px 7px", fontSize: 9.5, textAlign: "right", borderBottom: "1px solid #ddd", textTransform: "uppercase" }}>Harga</th>
          </tr>
        </thead>
        <tbody>
          {[["Ganti oli mesin", "Rp 75.000"], ["Tune up", "Rp 60.000"]].map(([n, p]) => (
            <tr key={n} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px 7px", fontSize: 11 }}>{n}</td>
              <td style={{ padding: "5px 7px", fontSize: 11, textAlign: "right" }}>{p}</td>
            </tr>
          ))}
          {[["Oli Motul 10W-40 ×1", "Rp 95.000"], ["Filter oli ×1", "Rp 45.000"]].map(([n, p]) => (
            <tr key={n} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "5px 7px", fontSize: 11, color: "#555" }}>{n}</td>
              <td style={{ padding: "5px 7px", fontSize: 11, textAlign: "right", color: "#555" }}>{p}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ borderTop: "2px solid #C8912A", paddingTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, color: "#C8912A" }}>
          <span>TOTAL</span><span>Rp 275.000</span>
        </div>
      </div>
    </div>
  </PanelChrome>
);

/* — Cek Status panel (gaya halaman /cek aktual) — */
const CekStatusPanel = () => (
  <PanelChrome title="NasMotion — Cek Status Kendaraan">
    <div style={{ display: "flex", gap: 9, marginBottom: 12 }}>
      <div style={{ flex: 1, background: "#08090D", border: "1px solid #1A2035", borderRadius: 10, padding: "11px 14px", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: "0.14em", color: "#8A9BB0" }}>
        B 1879 KTA
      </div>
      <div style={{ background: "#C8912A", borderRadius: 10, padding: "0 18px", display: "flex", alignItems: "center", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#06080D" }}>
        Cek
      </div>
    </div>

    <div style={{ background: "rgba(200,145,42,0.06)", border: "1px solid rgba(200,145,42,0.2)", borderLeft: "4px solid #C8912A", borderRadius: 12, padding: "13px 15px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 15.5, color: "#C8912A" }}>Sedang Dikerjakan</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(6,8,13,0.5)", borderRadius: 20, padding: "3px 9px" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C8912A", animation: "pulseGlow 2s ease-in-out infinite" }} />
          <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 9.5, fontWeight: 600, color: "#C8912A" }}>Live</span>
        </span>
      </div>
      <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 11.5, color: "#4E5D75" }}>
        Antrean #014 · Ganti oli + servis rutin
      </div>
    </div>

    <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#2E3A50", margin: "10px 0 6px" }}>Riwayat Servis</div>
    {[
      { d: "27 Sep 2026 · Servis rem",      st: "Selesai", c: "#52C97B" },
      { d: "12 Jun 2026 · Ganti rantai",    st: "Selesai", c: "#52C97B" },
    ].map((h) => (
      <div key={h.d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: "rgba(255,255,255,0.02)", border: "1px solid #111520", borderRadius: 8, marginBottom: 5 }}>
        <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 11.5, color: "#8A9BB0" }}>{h.d}</span>
        <StBadge label={h.st} color={h.c} />
      </div>
    ))}

    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#52C97B" }} />
      <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 10.5, color: "#2E3A50" }}>Tanpa login · hanya data publik · update otomatis</span>
    </div>
  </PanelChrome>
);

/* ═══════════════════════════════════════════════════════════════
   Landing
   ═══════════════════════════════════════════════════════════════ */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const [flowProgress, setFlowProgress] = useState(0);
  const flowRef = useRef(null);
  const flowRaf = useRef(0);

  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, []);

  // Scrollspy — indikator nav aktif (desktop + mobile menu)
  useEffect(() => {
    const els = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!els.length) return undefined;
    const onScroll = () => {
      const probe = window.innerHeight * 0.36;
      let current = "home";
      for (const el of els) {
        if (el.getBoundingClientRect().top <= probe) current = el.id;
      }
      setActiveId(current);
    };
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, []);

  // Workflow line — garis amber mengikuti scroll (rAF-throttled)
  useEffect(() => {
    const el = flowRef.current;
    if (!el) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const raf = requestAnimationFrame(() => setFlowProgress(1));
      return () => cancelAnimationFrame(raf);
    }
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = el.getBoundingClientRect();
      const total = r.height + window.innerHeight * 0.5;
      const passed = window.innerHeight * 0.72 - r.top;
      setFlowProgress(Math.min(1, Math.max(0, passed / total)));
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; flowRaf.current = requestAnimationFrame(update); }
    };
    flowRaf.current = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(flowRaf.current);
    };
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#06080D", color: "#CDD5E4", fontFamily: "Barlow, sans-serif", overflowX: "clip" }}>

      {/* ══════ 01 NAVBAR ══════ */}
      <header className={`lp-nav${scrolled ? " scrolled" : ""}`} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 60, borderBottom: "1px solid transparent", transition: "background 0.25s, border-color 0.25s" }}>
        <div className="lp-container" style={{ display: "flex", alignItems: "center", gap: 22, height: 62 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0 }} aria-label="NasMotion — beranda">
            <div style={{ width: 31, height: 31, borderRadius: 8, background: "rgba(200,145,42,0.10)", border: "1px solid rgba(200,145,42,0.20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IcLogo size={15} />
            </div>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "0.06em", textTransform: "uppercase", color: "#CDD5E4" }}>
              Nas<span style={{ color: "#C8912A" }}>Motion</span>
            </span>
          </Link>

          <div style={{ flex: 1 }} />

          <nav className="lp-nav-links" aria-label="Navigasi utama" style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className={`lp-nav-link${activeId === l.id ? " active" : ""}`} aria-current={activeId === l.id ? "true" : undefined}>{l.label}</a>
            ))}
          </nav>

          <Link to="/login" className="lp-nav-cta">Masuk</Link>

          <button
            className="lp-burger"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((p) => !p)}
            style={{ display: "none", background: "none", border: "1px solid #1A2035", borderRadius: 8, color: "#CDD5E4", cursor: "pointer", padding: 8, alignItems: "center" }}
          >
            {menuOpen ? <IcX /> : <IcMenu />}
          </button>
        </div>

        {menuOpen && (
          <div style={{ borderTop: "1px solid #1A2035", background: "rgba(8,10,16,0.98)", backdropFilter: "blur(16px)", padding: "8px 20px 18px", display: "flex", flexDirection: "column" }}>
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className={`lp-mobile-link${activeId === l.id ? " active" : ""}`}>{l.label}</a>
            ))}
            <Link to="/login" onClick={() => setMenuOpen(false)} className="lp-mobile-link" style={{ color: "#C8912A", fontWeight: 600 }}>Masuk →</Link>
          </div>
        )}
      </header>

      {/* ══════ 02 HERO ══════ */}
      <section id="home" style={{ position: "relative", overflow: "hidden", paddingTop: 118, paddingBottom: 72 }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }} aria-hidden="true">
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.18) saturate(0.4)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,8,13,0.86) 0%, rgba(6,8,13,0.62) 45%, rgba(6,8,13,0.98) 100%)" }} />
        </div>

        <div className="lp-container" style={{ position: "relative", zIndex: 1 }}>
          <div className="lp-hero-grid" style={{ display: "grid", gap: 48, alignItems: "center" }}>
            {/* LEFT — copy */}
            <div>
              <div className="anim-fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(200,145,42,0.10)", border: "1px solid rgba(200,145,42,0.20)", borderRadius: 20, padding: "5px 14px", marginBottom: 22 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8912A", boxShadow: "0 0 8px rgba(200,145,42,0.7)", animation: "pulseGlow 2.4s ease-in-out infinite" }} />
                <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C8912A" }}>
                  Workshop Management System
                </span>
              </div>

              <h1 className="anim-fade-up anim-d1" style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "clamp(40px, 5.6vw, 74px)", lineHeight: 1.02, letterSpacing: "0.01em", textTransform: "uppercase", color: "#CDD5E4", marginBottom: 20 }}>
                Run your workshop<br />
                <span style={{ color: "#C8912A" }}>without the chaos.</span>
              </h1>

              <p className="anim-fade-up anim-d2" style={{ fontSize: 15.5, lineHeight: 1.7, color: "#7A8BA0", maxWidth: 480, marginBottom: 30 }}>
                NasMotion brings vehicles, queues, mechanics, spareparts,
                invoices, and service history into one operational workflow.
              </p>

              <div className="anim-fade-up anim-d3" style={{ display: "flex", gap: 13, flexWrap: "wrap", marginBottom: 26 }}>
                <a href="#workflow" className="lp-btn-primary">Explore the Workflow</a>
                <Link to="/cek" className="lp-btn-ghost">
                  Cek Status Kendaraan
                  <IcArrow />
                </Link>
              </div>

              <div className="anim-fade-up anim-d4" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                {[["Admin", "#5B8DEF"], ["Kasir", "#52C97B"], ["Mekanik", "#C8912A"]].map(([r, c]) => (
                  <span key={r} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: c }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />{r}
                  </span>
                ))}
                <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 11.5, color: "#2E3A50" }}>— satu ekosistem, tiga peran</span>
              </div>
            </div>

            {/* RIGHT — product UI hero */}
            <div className="anim-fade-up anim-d2">
              <HeroQueuePanel />
              <DemoNote>Tampilan produk · data demo</DemoNote>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 03 PROBLEM → SOLUTION ══════ */}
      <section id="problem" className="lp-section reveal" style={{ padding: "88px 0", borderTop: "1px solid #111520", borderBottom: "1px solid #111520", background: "#08090D" }}>
        <div className="lp-container">
          <div className="lp-problem-grid" style={{ display: "grid", gap: 48, alignItems: "center" }}>
            {/* Copy + chaos */}
            <div>
              <h2 className="lp-h2" style={{ textAlign: "left", margin: "0 0 14px" }}>
                Workshop operations<br />become complicated <span style={{ color: "#C8912A" }}>fast.</span>
              </h2>
              <p className="lp-lead" style={{ textAlign: "left", margin: "0 0 28px" }}>
                Setiap kendaraan membawa antrean, mekanik membawa beberapa pekerjaan,
                sparepart bergerak, dan invoice menunggu — semuanya sekaligus.
              </p>

              <div className="lp-chaos" aria-hidden="true">
                {CHAOS.map((c, i) => (
                  <span key={c} style={{
                    display: "inline-block", padding: "6px 13px", margin: 5,
                    background: "rgba(255,255,255,0.025)", border: "1px solid #1A2035", borderRadius: 20,
                    fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12, color: "#4E5D75",
                    transform: `rotate(${[-2.5, 1.5, -1, 2, -1.5, 1][i]}deg) translateY(${[0, 6, -4, 2, 5, -3][i]}px)`,
                  }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Transition → organized */}
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, justifyContent: "center" }}>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #1A2035)" }} />
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C8912A" }}>
                  <IcArrow /> NasMotion connects the workflow
                </span>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #1A2035)" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 340, margin: "0 auto" }}>
                {["Vehicle", "Queue", "Repair", "Invoice", "History"].map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 10, padding: "9px 14px" }}>
                    <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 12, color: "#C8912A", width: 20 }}>0{i + 1}</span>
                    <span style={{ width: i < 4 ? 1 : 0, height: 18, borderLeft: i < 4 ? "1px dashed #1A2035" : "none" }} />
                    <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase", color: "#CDD5E4" }}>{s}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 12.5, color: "#2E3A50", marginTop: 16 }}>
                Satu alur — dari kendaraan masuk sampai riwayan tersimpan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 04 PRODUCT WORKFLOW ══════ */}
      <section id="workflow" className="lp-section reveal" style={{ padding: "96px 0" }}>
        <div className="lp-container">
          <div style={{ marginBottom: 56 }}>
            <p className="lp-eyebrow">Product Workflow</p>
            <h2 className="lp-h2">From the workshop floor<br />to the final invoice.</h2>
            <p className="lp-lead">One connected workflow from vehicle check-in to completed service.</p>
          </div>

          <div className="lp-flow7" ref={flowRef} style={{ "--flow-progress": String(flowProgress) }}>
            {WORKFLOW.map((s) => (
              <div key={s.num} className="lp-flow-step">
                <div className="lp-flow-node" aria-hidden="true">{s.icon}</div>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.2em", color: "#2E3A50", marginBottom: 8 }}>{s.num}</div>
                <h3 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: "0.05em", textTransform: "uppercase", color: "#CDD5E4", marginBottom: 7 }}>{s.title}</h3>
                <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 12.5, lineHeight: 1.65, color: "#4E5D75" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 05 FEATURE SHOWCASES ══════ */}
      <section id="showcase" className="lp-section" style={{ padding: "96px 0", background: "#08090D", borderTop: "1px solid #111520", borderBottom: "1px solid #111520" }}>
        <div className="lp-container">
          <div className="reveal" style={{ marginBottom: 60 }}>
            <p className="lp-eyebrow">Product Showcase</p>
            <h2 className="lp-h2">Built for the daily grind<br />of a real workshop.</h2>
          </div>

          {/* SHOWCASE 1 — Antrean Live */}
          <div className="lp-showcase reveal" style={{ display: "grid", gap: 44, alignItems: "center", marginBottom: 84 }}>
            <div style={{ maxWidth: 620 }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.24em", color: "#2E3A50", marginBottom: 12 }}>SHOWCASE — 01</div>
              <h3 className="lp-showcase-h">Know what's happening on the workshop floor.</h3>
              <p className="lp-showcase-p">
                Track vehicle queues, assign mechanics, and move work through
                the service process — dengan nomor antrean otomatis, status live,
                dan timer pengerjaan per kendaraan.
              </p>
              <ul className="lp-checklist">
                <li><IcCheck /> Auto-refresh antrean setiap 10 detik</li>
                <li><IcCheck /> Assign / replace mekanik dari satu layar</li>
                <li><IcCheck /> Status: menunggu → dikerjakan → selesai</li>
              </ul>
            </div>
            <div>
              <PanelChrome title="NasMotion — Antrean Live" pad={14}>
                {/* Filter tabs gaya QueueLive */}
                <div style={{ display: "flex", gap: 4, background: "#08090D", border: "1px solid #1A2035", borderRadius: 9, padding: 4, width: "fit-content", marginBottom: 12, flexWrap: "wrap" }}>
                  {[["Semua", "12", true], ["Menunggu", "1", false], ["Dikerjakan", "1", false], ["Selesai", "1", false]].map(([l, n, a]) => (
                    <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: a ? "#161C2A" : "transparent", border: a ? "1px solid #1A2035" : "1px solid transparent", borderRadius: 7, padding: "5px 11px", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, fontWeight: a ? 600 : 400, color: a ? "#CDD5E4" : "#4E5D75" }}>
                      {l}
                      <span style={{ background: a ? "rgba(200,145,42,0.15)" : "#111520", borderRadius: 10, padding: "1px 7px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 10.5, fontWeight: 700, color: a ? "#C8912A" : "#2E3A50" }}>{n}</span>
                    </span>
                  ))}
                </div>
                {/* Panoramic mini cards gaya QueueCard */}
                {[
                  { no: "014", plate: "B 1879 KTA", veh: "Toyota Avanza", owner: "Rian Pratama", st: "Dikerjakan", c: "#C8912A", m: "Suryo" },
                  { no: "016", plate: "L 9034 MN",  veh: "Mitsubishi Xpander", owner: "Sinta Dewi", st: "Selesai", c: "#52C97B", m: "Doni" },
                ].map((r) => (
                  <div key={r.no} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid #111520", borderRadius: 10, marginBottom: 8 }}>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 24, color: "#fff", minWidth: 36, lineHeight: 1, textShadow: `0 0 16px ${r.c}55` }}>{r.no}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 7, alignItems: "baseline" }}>
                        <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 14, color: "#CDD5E4", letterSpacing: "0.06em" }}>{r.plate}</span>
                        <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10.5, color: "#4E5D75" }}>{r.veh}</span>
                      </div>
                      <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 10.5, color: "#4E5D75" }}>{r.owner} · Mekanik: {r.m}</div>
                    </div>
                    <StBadge label={r.st} color={r.c} pulse={r.st === "Dikerjakan"} />
                  </div>
                ))}
              </PanelChrome>
              <DemoNote>Tampilan produk · data demo</DemoNote>
            </div>
          </div>

          {/* SHOWCASE 2 — Repair + Sparepart (copy kiri, UI kanan) */}
          <div className="lp-showcase reveal" style={{ display: "grid", gap: 44, alignItems: "center", marginBottom: 84 }}>
            <div>
              <RepairPanel />
              <DemoNote>Tampilan produk · data demo</DemoNote>
            </div>
            <div style={{ maxWidth: 620 }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.24em", color: "#2E3A50", marginBottom: 12 }}>SHOWCASE — 02</div>
              <h3 className="lp-showcase-h">Keep every repair traceable.</h3>
              <p className="lp-showcase-p">
                Manage repair progress and sparepart usage without losing track
                of the job — setiap pemakaian sparepart tercatat dan stok
                ter-update otomatis di database.
              </p>
              <ul className="lp-checklist">
                <li><IcCheck /> Jasa & sparepart dalam satu detail perbaikan</li>
                <li><IcCheck /> Stok terpotong / kembali otomatis</li>
                <li><IcCheck /> Progress terlihat di semua role</li>
              </ul>
            </div>
          </div>

          {/* SHOWCASE 3 — Invoice (UI kiri, copy kanan) */}
          <div className="lp-showcase reveal" style={{ display: "grid", gap: 44, alignItems: "center", marginBottom: 84 }}>
            <div style={{ maxWidth: 620 }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.24em", color: "#2E3A50", marginBottom: 12 }}>SHOWCASE — 03</div>
              <h3 className="lp-showcase-h">Turn completed work into clear transactions.</h3>
              <p className="lp-showcase-p">
                Generate invoices from service and sparepart costs, track payment
                status, and preserve the transaction record — nomor invoice unik
                dibuat aman bahkan saat antrean ramai.
              </p>
              <ul className="lp-checklist">
                <li><IcCheck /> Rincian jasa + sparepart otomatis</li>
                <li><IcCheck /> Tandai lunas & metode pembayaran</li>
                <li><IcCheck /> Cetak invoice siap dari browser</li>
              </ul>
            </div>
            <div>
              <InvoicePanel />
              <DemoNote>Tampilan produk · data demo</DemoNote>
            </div>
          </div>

          {/* SHOWCASE 4 — Public Cek Status (sekaligus Section 07) */}
          <div id="public-status" className="lp-showcase reveal" style={{ display: "grid", gap: 44, alignItems: "center", scrollMarginTop: 90 }}>
            <div>
              <CekStatusPanel />
              <DemoNote>Tampilan produk · data demo</DemoNote>
            </div>
            <div style={{ maxWidth: 620 }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.24em", color: "#2E3A50", marginBottom: 12 }}>SHOWCASE — 04 · PUBLIC</div>
              <h3 className="lp-showcase-h">Customers shouldn't have to call the workshop.</h3>
              <p className="lp-showcase-p">
                Let customers check vehicle progress from a public status page
                without signing in — cukup nomor plat. Hanya data publik yang
                tampil: status antrean dan riwayat servis.
              </p>
              <ul className="lp-checklist">
                <li><IcCheck /> Tanpa akun, tanpa instalasi</li>
                <li><IcCheck /> Status live + riwayat kunjungan</li>
                <li><IcCheck /> Endpoint publik terpisah & aman</li>
              </ul>
              <Link to="/cek" className="lp-btn-primary" style={{ marginTop: 24 }}>
                Try Cek Status
                <IcArrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 06 THREE ROLES ══════ */}
      <section id="roles" className="lp-section reveal" style={{ padding: "96px 0" }}>
        <div className="lp-container">
          <div style={{ marginBottom: 52 }}>
            <p className="lp-eyebrow">Roles</p>
            <h2 className="lp-h2">One system. Three roles.</h2>
            <p className="lp-lead">Setiap peran mendapat tampilan yang sesuai tanggung jawabnya — tidak lebih, tidak kurang.</p>
          </div>

          <div className="lp-roles-grid" style={{ display: "grid", gap: 16 }}>
            {ROLES.map((r) => (
              <div key={r.name} style={{ background: "#0C0F18", border: "1px solid #1A2035", borderTop: `3px solid ${r.color}`, borderRadius: 12, padding: "26px 26px 24px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 23, letterSpacing: "0.06em", textTransform: "uppercase", color: r.color }}>{r.name}</span>
                  <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2E3A50" }}>{r.tag}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {r.items.map((it) => (
                    <span key={it} style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "Barlow, sans-serif", fontSize: 13, color: "#8A9BB0" }}>
                      <span style={{ color: r.color, display: "inline-flex", flexShrink: 0 }}><IcCheck /></span>
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 08 ENGINEERING DEPTH ══════ */}
      <section className="lp-section reveal" style={{ padding: "88px 0", background: "#08090D", borderTop: "1px solid #111520", borderBottom: "1px solid #111520" }}>
        <div className="lp-container">
          <div className="lp-eng-grid" style={{ display: "grid", gap: 48, alignItems: "center" }}>
            <div>
              <p className="lp-eyebrow" style={{ textAlign: "left" }}>Under the Hood</p>
              <h2 className="lp-h2" style={{ textAlign: "left", margin: "0 0 14px", fontSize: "clamp(26px, 3.4vw, 38px)" }}>
                Built as a real<br />full-stack system.
              </h2>
              <p className="lp-lead" style={{ textAlign: "left", margin: 0 }}>
                Bukan mockup — sistem operasional utuh: autentikasi berbasis JWT,
                kontrol akses per role, API REST terstruktur, dan integritas data
                yang dijaga di level database.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
                {TECHS.map((t) => (
                  <span key={t} style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.08em", color: "#4E5D75", background: "rgba(255,255,255,0.025)", border: "1px solid #1A2035", borderRadius: 7, padding: "6px 12px" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Architecture chain */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }} aria-hidden="true">
              {[
                { t: "Browser",        d: "Antrean Live · Invoice · Cek Status", icon: <IcCar /> },
                { t: "React",          d: "SPA · role-based UI",                 icon: <IcQueue /> },
                { t: "REST API",       d: "Secure · parameterized",              icon: <IcReceipt /> },
                { t: "Express",        d: "JWT auth · RBAC middleware",          icon: <IcWrench /> },
                { t: "PostgreSQL / Supabase", d: "Transaksi · trigger stok",     icon: <IcBox /> },
              ].map((n, i, arr) => (
                <div key={n.t} style={{ width: "100%", maxWidth: 340, textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 10, padding: "10px 15px", textAlign: "left" }}>
                    <span style={{ color: "#C8912A", display: "inline-flex", flexShrink: 0 }}>{n.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontWeight: 600, fontSize: 13, color: "#CDD5E4" }}>{n.t}</div>
                      <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 10.5, color: "#2E3A50" }}>{n.d}</div>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "3px 0", color: "#2E3A50" }}>
                      <svg width="12" height="16" viewBox="0 0 12 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><polyline points="2 8 6 12 10 8"/></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ 09 STATEMENT ══════ */}
      <section className="lp-section reveal" style={{ padding: "110px 0", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", width: 620, height: 620, transform: "translate(-50%, -50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(200,145,42,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="lp-container" style={{ position: "relative", textAlign: "center" }}>
          <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "clamp(26px, 3.8vw, 46px)", lineHeight: 1.25, letterSpacing: "0.01em", color: "#CDD5E4", maxWidth: 780, margin: "0 auto", textTransform: "uppercase" }}>
            Every vehicle has a story.<br />
            <span style={{ color: "#C8912A" }}>NasMotion keeps the whole story connected.</span>
          </p>
        </div>
      </section>

      {/* ══════ 10 FINAL CTA ══════ */}
      <section className="lp-section reveal" style={{ padding: "96px 0", background: "#08090D", borderTop: "1px solid #111520" }}>
        <div className="lp-container" style={{ textAlign: "center" }}>
          <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "clamp(34px, 5vw, 58px)", letterSpacing: "0.01em", textTransform: "uppercase", color: "#CDD5E4", lineHeight: 1.08, marginBottom: 16 }}>
            Keep every service <span style={{ color: "#C8912A" }}>moving.</span>
          </h2>
          <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 15, color: "#4E5D75", maxWidth: 460, margin: "0 auto 34px", lineHeight: 1.7 }}>
            One operational system for the workshop floor, front desk, and management.
          </p>
          <div style={{ display: "flex", gap: 13, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/login" className="lp-btn-primary">Enter NasMotion</Link>
            <Link to="/cek" className="lp-btn-ghost">Cek Status<IcArrow /></Link>
          </div>
        </div>
      </section>

      {/* ══════ 11 FOOTER ══════ */}
      <footer style={{ borderTop: "1px solid #111520", background: "#08090D", padding: "46px 0 30px" }}>
        <div className="lp-container">
          <div className="lp-footer-grid" style={{ display: "grid", gap: 32, marginBottom: 36 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(200,145,42,0.10)", border: "1px solid rgba(200,145,42,0.20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IcLogo size={14} />
                </div>
                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.06em", textTransform: "uppercase", color: "#CDD5E4" }}>
                  Nas<span style={{ color: "#C8912A" }}>Motion</span>
                </span>
              </div>
              <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#2E3A50", marginBottom: 12 }}>
                Workshop Management System
              </div>
              <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "#4E5D75", lineHeight: 1.7, maxWidth: 300 }}>
                Kendaraan, antrean, perbaikan, sparepart, invoice, dan laporan —
                terhubung dalam satu alur kerja.
              </p>
            </div>

            <div>
              <FooterHead>Navigasi</FooterHead>
              {[["#home", "Home"], ["#showcase", "Features"], ["#workflow", "Workflow"], ["#public-status", "Cek Status"]].map(([h, l]) => (
                <a key={h} href={h} className="lp-footer-link">{l}</a>
              ))}
            </div>

            <div>
              <FooterHead>Account</FooterHead>
              <Link to="/login" className="lp-footer-link">Login</Link>
              <Link to="/cek" className="lp-footer-link">Cek Status Kendaraan</Link>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #111520", paddingTop: 20 }}>
            <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1E2840" }}>
              © {new Date().getFullYear()} NasMotion · Nasution Workshop
            </span>
          </div>
        </div>
      </footer>

      {/* ══════ Styles ══════ */}
      <style>{`
        .lp-container { max-width: 1180px; margin: 0 auto; padding: 0 24px; }
        .lp-section { scroll-margin-top: 74px; }
        .lp-eyebrow { font-family: "Barlow Semi Condensed", sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase; color: #C8912A; text-align: center; margin: 0 0 14px; }
        .lp-h2 { font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-size: clamp(30px, 4.4vw, 48px); letter-spacing: 0.01em; text-transform: uppercase; color: #CDD5E4; line-height: 1.1; text-align: center; margin: 0 0 14px; }
        .lp-lead { font-family: "Barlow", sans-serif; font-size: 15px; color: #4E5D75; text-align: center; max-width: 540px; margin: 0 auto; line-height: 1.7; }
        .lp-showcase-h { font-family: "Barlow Condensed", sans-serif; font-weight: 800; font-size: clamp(24px, 3vw, 36px); letter-spacing: 0.01em; text-transform: uppercase; color: #CDD5E4; line-height: 1.12; margin: 0 0 14px; }
        .lp-showcase-p { font-family: "Barlow", sans-serif; font-size: 14.5px; color: #7A8BA0; line-height: 1.75; margin: 0 0 20px; }
        .lp-checklist { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 9px; }
        .lp-checklist li { display: flex; align-items: center; gap: 10px; font-family: "Barlow", sans-serif; font-size: 13.5px; color: #8A9BB0; }
        .lp-checklist li svg { color: #52C97B; flex-shrink: 0; }

        .lp-nav { background: transparent; }
        .lp-nav.scrolled { background: rgba(8,10,16,0.92); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom-color: #1A2035; }
        .lp-nav-link { position: relative; font-family: "Barlow Semi Condensed", sans-serif; font-size: 12.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #4E5D75; text-decoration: none; transition: color 0.2s; padding: 4px 0; }
        .lp-nav-link::after { content: ""; position: absolute; left: 0; right: 100%; bottom: -2px; height: 2px; background: #C8912A; transition: right 0.25s cubic-bezier(0.22,1,0.36,1); }
        .lp-nav-link:hover, .lp-nav-link:focus-visible { color: #CDD5E4; }
        .lp-nav-link.active { color: #CDD5E4; }
        .lp-nav-link.active::after { right: 0; }
        .lp-nav-cta { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; color: #06080D; background: #C8912A; border-radius: 8px; padding: 7px 17px; transition: background 0.2s, transform 0.15s; flex-shrink: 0; }
        .lp-nav-cta:hover, .lp-nav-cta:focus-visible { background: #DFA83C; transform: translateY(-1px); }
        .lp-mobile-link { font-family: "Barlow Semi Condensed", sans-serif; font-size: 14.5px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: #8A9BB0; text-decoration: none; padding: 13px 2px; border-bottom: 1px solid #111520; }
        .lp-mobile-link:hover, .lp-mobile-link:focus-visible, .lp-mobile-link.active { color: #C8912A; }

        .lp-btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 9px; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 15px; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; color: #06080D; background: #C8912A; border-radius: 9px; padding: 13px 26px; border: none; cursor: pointer; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; }
        .lp-btn-primary:hover, .lp-btn-primary:focus-visible { background: #DFA83C; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(200,145,42,0.22); }
        .lp-btn-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 9px; font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 15px; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; color: #CDD5E4; background: rgba(255,255,255,0.03); border: 1px solid #222A40; border-radius: 9px; padding: 13px 26px; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
        .lp-btn-ghost:hover, .lp-btn-ghost:focus-visible { border-color: #C8912A; background: rgba(200,145,42,0.06); }

        .lp-hero-grid { grid-template-columns: 1.05fr 1fr; }
        .lp-problem-grid { grid-template-columns: 1.1fr 1fr; }
        .lp-showcase { grid-template-columns: 1fr 1fr; }
        .lp-showcase > div:nth-child(2) { justify-self: stretch; }
        .lp-eng-grid { grid-template-columns: 1.05fr 1fr; }
        .lp-roles-grid { grid-template-columns: repeat(3, 1fr); }
        .lp-footer-grid { grid-template-columns: 2fr 1fr 1fr; }
        .lp-footer-link { display: block; font-family: "Barlow", sans-serif; font-size: 13px; color: #4E5D75; text-decoration: none; padding: 5px 0; transition: color 0.2s; }
        .lp-footer-link:hover, .lp-footer-link:focus-visible { color: #C8912A; }

        /* Workflow: 7 kolom + garis penghubung */
        .lp-flow7 { display: grid; grid-template-columns: repeat(7, 1fr); gap: 18px; position: relative; }
        .lp-flow7::before { content: ""; position: absolute; top: 26px; left: calc(100%/14); right: calc(100%/14); height: 1px; background: #1A2035; }
        .lp-flow7::after { content: ""; position: absolute; top: 26px; left: calc(100%/14); width: calc((100% - 100%/7) * var(--flow-progress, 0)); max-width: calc(100% - 100%/7); height: 1px; background: linear-gradient(to right, #C8912A, rgba(200,145,42,0.55)); transition: width 0.15s linear; }

        .lp-panel { transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s, border-top-color 0.3s; }
        .lp-panel:hover { transform: translateY(-3px); box-shadow: 0 42px 92px rgba(0,0,0,0.65); border-top-color: #DFA83C; }
        .lp-flow-step { text-align: center; position: relative; }
        .lp-flow-node { width: 52px; height: 52px; margin: 0 auto 12px; border-radius: 13px; background: #0C0F18; border: 1px solid #1A2035; display: flex; align-items: center; justify-content: center; color: #C8912A; position: relative; z-index: 1; box-shadow: 0 0 0 6px #06080D; }

        .lp-chaos { min-height: 90px; display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-start; }

        /* Focus states */
        a:focus-visible, button:focus-visible { outline: 2px solid #C8912A; outline-offset: 2px; border-radius: 6px; }

        /* Reveal on scroll */
        .reveal { opacity: 0; transform: translateY(26px); transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .reveal.in-view { opacity: 1; transform: translateY(0); }

        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
          .anim-fade-up { animation: none !important; opacity: 1 !important; }
          .lp-nav-link::after, .lp-flow7::after, .lp-panel { transition: none !important; }
          * { scroll-behavior: auto !important; }
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .lp-hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .lp-hero-grid > div:first-child { text-align: center; }
          .lp-hero-grid > div:first-child .anim-fade-up { margin-left: auto; margin-right: auto; }
          .lp-hero-grid .lp-btn-primary, .lp-hero-grid .lp-btn-ghost { margin: 0 4px; }
          .lp-problem-grid { grid-template-columns: 1fr; }
          .lp-showcase { grid-template-columns: 1fr; }
          .lp-showcase > div { max-width: 640px; margin: 0 auto; width: 100%; }
          .lp-eng-grid { grid-template-columns: 1fr; }
          .lp-roles-grid { grid-template-columns: 1fr; }
          .lp-flow7 { grid-template-columns: repeat(4, 1fr); gap: 26px 20px; }
          .lp-flow7::before, .lp-flow7::after { display: none; }
          .lp-flow-step:last-child { grid-column: 2; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr; }
        }

        /* Mobile */
        @media (max-width: 900px) {
          .lp-nav-links, .lp-nav .lp-nav-cta { display: none !important; }
          .lp-burger { display: flex !important; }
        }
        @media (max-width: 768px) {
          .lp-container { padding: 0 18px; }
          .lp-section { padding-top: 64px !important; padding-bottom: 64px !important; }
          .lp-flow7 { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; gap: 0; }
          .lp-flow-step:last-child { grid-column: auto; }
          .lp-flow-step { display: grid; grid-template-columns: 52px 1fr; gap: 0 16px; text-align: left; padding-bottom: 26px; position: relative; }
          .lp-flow-step::before { content: ""; position: absolute; left: 26px; top: 52px; bottom: 0; width: 1px; background: #1A2035; }
          .lp-flow-step:last-child::before { display: none; }
          .lp-flow-node { margin: 0; box-shadow: 0 0 0 6px #06080D; }
          .lp-flow-step h3, .lp-flow-step p, .lp-flow-step > div:nth-child(2) { grid-column: 2; margin: 0 0 6px; }
          .lp-flow-step h3 { grid-row: 1; align-self: center; }
          .lp-footer-grid { grid-template-columns: 1fr; }
          .lp-chaos { justify-content: center; }
        }

        /* Small phone */
        @media (max-width: 420px) {
          .lp-btn-primary, .lp-btn-ghost { width: 100%; }
        }
      `}</style>
    </div>
  );
}

/* ── Footer heading ───────────────────────────────────────────── */
function FooterHead({ children }) {
  return (
    <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#2E3A50", marginBottom: 12 }}>
      {children}
    </div>
  );
}
