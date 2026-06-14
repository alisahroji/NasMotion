import { useState, useCallback, useRef, useEffect } from "react";
import api from "../../utils/api";

const BG_URL = "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80";

const STATUS = {
  waiting:     { label: "Menunggu Pengerjaan", color: "#5B8DEF", bg: "rgba(91,141,239,0.08)",  icon: "⏳", desc: "Kendaraan Anda sudah terdaftar dan sedang menunggu giliran."      },
  in_progress: { label: "Sedang Dikerjakan",   color: "#C8912A", bg: "rgba(200,145,42,0.08)",  icon: "🔧", desc: "Mekanik kami sedang menangani kendaraan Anda saat ini."            },
  done:        { label: "Selesai",             color: "#52C97B", bg: "rgba(82,201,123,0.08)",  icon: "✅", desc: "Kendaraan Anda sudah selesai diperbaiki. Silakan ke kasir."        },
  cancelled:   { label: "Dibatalkan",          color: "#E74C3C", bg: "rgba(231,76,60,0.08)",   icon: "❌", desc: "Antrean ini telah dibatalkan. Hubungi kami untuk info lebih lanjut." },
};

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const fmtDate = (s) =>
  s ? new Date(s).toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const timeElapsed = (s) => {
  if (!s) return null;
  const m = Math.floor((Date.now() - new Date(s)) / 60000);
  if (m < 1)  return "Baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h} jam ${rm} menit lalu`;
};

export default function CekStatus() {
  const [plate,    setPlate]   = useState("");
  const [result,   setResult]  = useState(null); // { vehicle, history }
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState("");
  const [searched, setSearched]= useState(false);
  const [tick,     setTick]    = useState(0);   // untuk update timer tiap menit
  const inputRef               = useRef(null);
  const intervalRef            = useRef(null);

  // Update timer tiap 30 detik
  useEffect(() => {
    intervalRef.current = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Auto-refresh data tiap 15 detik jika ada hasil
  useEffect(() => {
    if (!result) return;
    const t = setInterval(() => {
      handleSearch(null, plate, true);
    }, 15000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, plate]);

  const handleSearch = useCallback(async (e, forcePlate, silent = false) => {
    e?.preventDefault();
    const q = (forcePlate ?? plate).trim().toUpperCase();
    if (!q) { setError("Masukkan plat nomor kendaraan."); return; }

    if (!silent) { setLoading(true); setError(""); setSearched(true); }

    try {
      const res = await api.get(`/vehicles/plate/${encodeURIComponent(q)}`);
      setResult(res.data.data);
      setError("");
    } catch (err) {
      if (err.response?.status === 404) {
        setResult(null);
        if (!silent) setError(`Kendaraan dengan plat "${q}" tidak ditemukan dalam sistem kami.`);
      } else {
        if (!silent) setError("Terjadi kesalahan. Coba lagi beberapa saat.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [plate]);

  const handleClear = () => {
    setPlate(""); setResult(null);
    setError(""); setSearched(false);
    inputRef.current?.focus();
  };

  // Ambil antrean aktif (bukan done/cancelled)
  const activeQueue = result?.history?.find(
    (h) => h.status === "waiting" || h.status === "in_progress"
  );
  const lastQueue = result?.history?.[0]; // riwayat terbaru

  return (
    <div style={{ minHeight: "100vh", background: "#06080D", fontFamily: "Barlow, sans-serif", position: "relative" }}>

      {/* ── Background ─────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${BG_URL})`,
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.15) saturate(0.4)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(6,8,13,0.97) 0%, rgba(6,8,13,0.85) 100%)",
        }} />
        {/* Grid lines dekoratif */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {[15, 35, 55, 75].map((l) => (
            <div key={l} style={{ position: "absolute", top: 0, bottom: 0, left: `${l}%`, width: 1, background: "linear-gradient(to bottom, transparent, rgba(200,145,42,0.05), transparent)" }} />
          ))}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>

        {/* Header / Navbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0 40px", borderBottom: "1px solid #1A2035", marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(200,145,42,0.10)", border: "1px solid rgba(200,145,42,0.20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8912A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "0.06em", textTransform: "uppercase", color: "#CDD5E4" }}>
                Nas<span style={{ color: "#C8912A" }}>Motion</span>
              </div>
              <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#2E3A50", marginTop: 1 }}>
                Cek Status Kendaraan
              </div>
            </div>
          </div>
          <a href="/login" style={{
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "Barlow Semi Condensed, sans-serif",
            fontSize: 12, fontWeight: 600, color: "#4E5D75",
            textDecoration: "none", letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "7px 14px",
            border: "1px solid #1A2035", borderRadius: 8,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C8912A"; e.currentTarget.style.color = "#C8912A"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1A2035"; e.currentTarget.style.color = "#4E5D75"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Login Staf
          </a>
        </div>

        {/* Hero Text */}
        <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeUp 0.6s ease forwards" }}>
          <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 46px)", letterSpacing: "0.02em", textTransform: "uppercase", color: "#CDD5E4", lineHeight: 1.1, marginBottom: 12 }}>
            Cek Status<br />
            <span style={{ color: "#C8912A" }}>Kendaraan Anda</span>
          </h1>
          <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, color: "#4E5D75", lineHeight: 1.7, maxWidth: 420, margin: "0 auto" }}>
            Masukkan nomor plat kendaraan untuk melihat status perbaikan secara real-time tanpa perlu menunggu di bengkel.
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} style={{ marginBottom: 36, animation: "fadeUp 0.6s ease 0.1s forwards", opacity: 0 }}>
          <div style={{
            background: "rgba(12,15,24,0.90)",
            border: "1px solid #1A2035",
            borderRadius: 16, padding: "20px",
            backdropFilter: "blur(20px)",
          }}>
            <label style={{ display: "block", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4E5D75", marginBottom: 10 }}>
              Nomor Plat Kendaraan
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, position: "relative" }}>
                {/* Plat decorator */}
                <div style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800,
                  fontSize: 12, color: "#2E3A50", letterSpacing: "0.1em",
                  display: "flex", alignItems: "center",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <input
                  ref={inputRef}
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="Contoh: B 1234 ABC"
                  autoComplete="off"
                  autoCapitalize="characters"
                  style={{
                    width: "100%", background: "#08090D",
                    border: "1px solid #1A2035", borderRadius: 10,
                    padding: "14px 40px 14px 38px",
                    color: "#CDD5E4", fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700, fontSize: 20,
                    letterSpacing: "0.14em", textTransform: "uppercase", outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#C8912A"; e.target.style.boxShadow = "0 0 0 3px rgba(200,145,42,0.10)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "#1A2035"; e.target.style.boxShadow = "none"; }}
                />
                {plate && (
                  <button type="button" onClick={handleClear} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#2E3A50", cursor: "pointer", display: "flex", padding: 4, transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#C8912A")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#2E3A50")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>
              <button type="submit" disabled={loading} style={{
                flexShrink: 0, background: loading ? "rgba(200,145,42,0.10)" : "#C8912A",
                border: "none", borderRadius: 10,
                padding: "0 24px", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700,
                fontSize: 15, letterSpacing: "0.10em", textTransform: "uppercase",
                color: loading ? "#C8912A" : "#06080D",
                transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
              }}>
                {loading ? (
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(200,145,42,0.3)", borderTop: "2px solid #C8912A", borderRadius: "50%", animation: "spinSlow 0.7s linear infinite", display: "inline-block" }} />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                )}
                {loading ? "Mencari..." : "Cek"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, background: "rgba(231,76,60,0.08)", border: "1px solid rgba(231,76,60,0.20)", borderRadius: 8, padding: "10px 14px", animation: "fadeUp 0.3s ease forwards" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "#E74C3C" }}>{error}</span>
              </div>
            )}
          </div>
        </form>

        {/* ── HASIL ────────────────────────────────────────── */}
        {result && (
          <div style={{ animation: "fadeUp 0.5s ease forwards" }}>

            {/* Info Kendaraan */}
            <div style={{ background: "rgba(12,15,24,0.90)", border: "1px solid #1A2035", borderTop: "2px solid #C8912A", borderRadius: 14, padding: "20px 22px", marginBottom: 16, backdropFilter: "blur(20px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
                    Data Kendaraan
                  </div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 30, color: "#CDD5E4", letterSpacing: "0.08em", marginBottom: 4 }}>
                    {result.plate_number}
                  </div>
                  <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 14, color: "#8A9BB0", marginBottom: 2 }}>
                    {result.owner_name}
                  </div>
                  <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#4E5D75" }}>
                    {[result.vehicle_brand, result.vehicle_type, result.vehicle_year].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Total Kunjungan</div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 28, color: "#C8912A" }}>
                    {result.history?.length ?? 0}×
                  </div>
                </div>
              </div>

              {/* Auto-refresh indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, paddingTop: 12, borderTop: "1px solid #111520" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#52C97B", animation: "pulseGlow 2s ease-in-out infinite" }} />
                <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 11, color: "#2E3A50" }}>
                  Data diperbarui otomatis setiap 15 detik
                </span>
              </div>
            </div>

            {/* Status Antrean Aktif */}
            {activeQueue ? (
              <ActiveStatus queue={activeQueue} key={tick} />
            ) : lastQueue?.status === "done" ? (
              <DoneStatus queue={lastQueue} />
            ) : null}

            {/* Riwayat Servis */}
            {(result.history?.length ?? 0) > 0 && (
              <div style={{ background: "rgba(12,15,24,0.90)", border: "1px solid #1A2035", borderRadius: 14, padding: "18px 22px", backdropFilter: "blur(20px)" }}>
                <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>
                  Riwayat Servis ({result.history.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.history.map((h, i) => {
                    const st = STATUS[h.status] ?? STATUS.waiting;
                    return (
                      <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid #111520", borderRadius: 10 }}>
                        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 15, color: "#2E3A50", minWidth: 28 }}>
                          #{String(h.queue_number).padStart(2,"0")}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 13, color: "#8A9BB0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {h.complaint}
                          </div>
                          <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 11, color: "#2E3A50", marginTop: 2 }}>
                            {fmtDate(h.created_at)}
                          </div>
                        </div>
                        {h.total_amount && (
                          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, color: "#C8912A", fontWeight: 700, flexShrink: 0 }}>
                            {formatRp(h.total_amount)}
                          </div>
                        )}
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: st.bg, border: `1px solid ${st.color}25`, borderRadius: 20, padding: "2px 10px", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, fontWeight: 600, color: st.color, flexShrink: 0 }}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty / Initial State */}
        {!result && !error && !loading && (
          <div style={{ textAlign: "center", paddingBottom: 60, animation: "fadeUp 0.6s ease 0.2s forwards", opacity: 0 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>
              {[
                { icon: "🔵", label: "Menunggu",   desc: "Terdaftar, belum dikerjakan" },
                { icon: "🟡", label: "Dikerjakan", desc: "Mekanik sedang bekerja"       },
                { icon: "🟢", label: "Selesai",    desc: "Siap diambil ke kasir"        },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(12,15,24,0.60)", border: "1px solid #1A2035", borderRadius: 12, padding: "16px 20px", textAlign: "center", minWidth: 140 }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 14, color: "#CDD5E4", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 11, color: "#2E3A50", lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "#2E3A50" }}>
              Masukkan plat nomor di atas untuk mulai
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", paddingBottom: 32, paddingTop: 24, borderTop: "1px solid #111520", marginTop: 40 }}>
          <p style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1E2840" }}>
            © 2025 NasMotion · Nasution Workshop · Sistem Informasi Bengkel
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Active Status Card ────────────────────────────────────────
const ActiveStatus = ({ queue }) => {
  const st = STATUS[queue.status] ?? STATUS.waiting;

  return (
    <div style={{
      background: st.bg, border: `1px solid ${st.color}25`,
      borderLeft: `4px solid ${st.color}`,
      borderRadius: 14, padding: "20px 22px",
      marginBottom: 16, backdropFilter: "blur(20px)",
      animation: "fadeUp 0.4s ease forwards",
    }}>
      {/* Status header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 28 }}>{st.icon}</div>
        <div>
          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: st.color, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.7, marginBottom: 3 }}>
            Status Saat Ini
          </div>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 22, color: st.color, letterSpacing: "0.02em" }}>
            {st.label}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, background: "rgba(6,8,13,0.4)", borderRadius: 20, padding: "4px 12px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.color, boxShadow: `0 0 8px ${st.color}`, animation: queue.status === "in_progress" ? "pulseGlow 2s ease-in-out infinite" : "none" }} />
          <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: st.color, fontWeight: 600 }}>Live</span>
        </div>
      </div>

      {/* Desc */}
      <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, color: "#8A9BB0", lineHeight: 1.6, marginBottom: 14 }}>
        {st.desc}
      </p>

      {/* Detail grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <InfoItem label="Nomor Antrean" value={`#${String(queue.queue_number).padStart(2,"0")}`} accent />
        <InfoItem label="Keluhan" value={queue.complaint} />
        {queue.mekanik_name && <InfoItem label="Mekanik" value={queue.mekanik_name} />}
        {queue.status === "in_progress" && queue.started_at && (
          <InfoItem label="Mulai Dikerjakan" value={timeElapsed(queue.started_at)} />
        )}
        {queue.services?.length > 0 && (
          <div style={{ gridColumn: "1/-1" }}>
            <InfoItem label="Jenis Servis" value={queue.services.map((s) => s.service_name).join(", ")} />
          </div>
        )}
      </div>

      {/* Note untuk selesai */}
      {queue.status === "in_progress" && (
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, background: "rgba(6,8,13,0.4)", borderRadius: 8, padding: "10px 14px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4E5D75" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#4E5D75" }}>
            Halaman ini otomatis update setiap 15 detik
          </span>
        </div>
      )}
    </div>
  );
};

// ── Done Status Card ──────────────────────────────────────────
const DoneStatus = ({ queue }) => (
  <div style={{
    background: "rgba(82,201,123,0.06)", border: "1px solid rgba(82,201,123,0.20)",
    borderLeft: "4px solid #52C97B", borderRadius: 14,
    padding: "20px 22px", marginBottom: 16,
    backdropFilter: "blur(20px)", animation: "fadeUp 0.4s ease forwards",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 28 }}>✅</span>
      <div>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: "#52C97B" }}>
          Kendaraan Selesai!
        </div>
        <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "#4E5D75", marginTop: 2 }}>
          Silakan ke kasir untuk pembayaran dan pengambilan kendaraan.
        </div>
      </div>
    </div>
    {queue.total_amount && (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(6,8,13,0.4)", borderRadius: 8, padding: "12px 16px", marginTop: 4 }}>
        <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 13, color: "#4E5D75", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Biaya</span>
        <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 22, color: "#C8912A" }}>{formatRp(queue.total_amount)}</span>
      </div>
    )}
  </div>
);

// ── Info Item ─────────────────────────────────────────────────
const InfoItem = ({ label, value, accent }) => (
  <div style={{ background: "rgba(6,8,13,0.35)", borderRadius: 8, padding: "10px 12px" }}>
    <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2E3A50", marginBottom: 4 }}>{label}</div>
    <div style={{ fontFamily: accent ? "Barlow Condensed, sans-serif" : "Barlow, sans-serif", fontWeight: accent ? 700 : 400, fontSize: accent ? 18 : 13, color: accent ? "#CDD5E4" : "#8A9BB0", lineHeight: 1.4, wordBreak: "break-word" }}>
      {value || "—"}
    </div>
  </div>
);