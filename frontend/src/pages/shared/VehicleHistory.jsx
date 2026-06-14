import { useState, useCallback, useRef, memo } from "react";
import { toast } from "sonner";
import api from "../../utils/api";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const fmtDate = (s) => s ? new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const STATUS = {
  waiting:     { label: "Menunggu",   color: "#5B8DEF" },
  in_progress: { label: "Dikerjakan", color: "#C8912A" },
  done:        { label: "Selesai",    color: "#52C97B" },
  cancelled:   { label: "Batal",      color: "#E74C3C" },
};

// ── History Card ──────────────────────────────────────────────
const HistoryCard = memo(({ item, index }) => {
  const [open, setOpen] = useState(false);
  const st = STATUS[item.status] ?? STATUS.waiting;

  return (
    <div style={{
      background: "#0C0F18", border: "1px solid #1A2035",
      borderLeft: `3px solid ${st.color}`, borderRadius: 12,
      overflow: "hidden", transition: "box-shadow 0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)")}
    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Header Row */}
      <div
        onClick={() => setOpen((p) => !p)}
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", cursor: "pointer" }}
      >
        {/* Number */}
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${st.color}12`, border: `1px solid ${st.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 14, color: st.color }}>
            {String(index + 1).padStart(2,"0")}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 15, color: "#CDD5E4", letterSpacing: "0.02em" }}>
              #{String(item.queue_number).padStart(2,"0")} — Servis ke-{index + 1}
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: `${st.color}12`, border: `1px solid ${st.color}25`,
              borderRadius: 20, padding: "2px 9px",
              fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, fontWeight: 600, color: st.color,
            }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: st.color }} />
              {st.label}
            </span>
          </div>
          <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#4E5D75" }}>
            {fmtDate(item.created_at)}
            {item.mekanik_name && <span> · Mekanik: {item.mekanik_name}</span>}
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {item.total_amount && (
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, color: "#C8912A" }}>
              {formatRp(item.total_amount)}
            </div>
          )}
          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", marginTop: 2 }}>
            {open ? "▲ tutup" : "▼ detail"}
          </div>
        </div>
      </div>

      {/* Expanded Detail */}
      {open && (
        <div style={{ borderTop: "1px solid #1A2035", padding: "14px 18px 16px", background: "#08090D" }}>
          {/* Complaint */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>Keluhan</div>
            <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "#8A9BB0", lineHeight: 1.6 }}>{item.complaint}</p>
          </div>

          {/* Services */}
          {item.services?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Jasa Servis</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {item.services.map((s, i) => (
                  <span key={i} style={{ background: "rgba(200,145,42,0.08)", border: "1px solid rgba(200,145,42,0.18)", borderRadius: 20, padding: "3px 11px", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: "#C8912A" }}>
                    {s.service_name} · {formatRp(s.price)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spareparts */}
          {item.spareparts?.length > 0 && (
            <div>
              <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>Sparepart</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {item.spareparts.map((sp, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#8A9BB0", padding: "4px 0", borderBottom: "1px solid #111520" }}>
                    <span>{sp.sparepart_name} <span style={{ color: "#2E3A50" }}>×{sp.qty}</span></span>
                    <span style={{ color: "#4E5D75" }}>{formatRp(sp.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status paid */}
          {item.payment_status && (
            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
              <span style={{
                fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, fontWeight: 600,
                color: item.payment_status === "paid" ? "#52C97B" : "#C8912A",
              }}>
                {item.payment_status === "paid" ? "✓ Sudah Dibayar" : "⏳ Belum Dibayar"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
HistoryCard.displayName = "HistoryCard";

// ── VehicleHistory ────────────────────────────────────────────
export default function VehicleHistory() {
  const [query,    setQuery]   = useState("");
  const [vehicle,  setVehicle] = useState(null);
  const [history,  setHistory] = useState([]);
  const [loading,  setLoading] = useState(false);
  const [searched, setSearched]= useState(false);
  const inputRef               = useRef(null);

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    const q = query.trim().toUpperCase();
    if (!q) { toast.error("Masukkan plat nomor."); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/vehicles/plate/${encodeURIComponent(q)}`);
      setVehicle(res.data.data);
      setHistory(res.data.data.history ?? []);
    } catch (err) {
      if (err.response?.status === 404) {
        setVehicle(null); setHistory([]);
        toast.error(`Kendaraan dengan plat "${q}" tidak ditemukan.`);
      } else {
        toast.error("Gagal mencari kendaraan.");
      }
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleClear = () => {
    setQuery(""); setVehicle(null);
    setHistory([]); setSearched(false);
    inputRef.current?.focus();
  };

  const totalSpend = history
    .filter((h) => h.payment_status === "paid")
    .reduce((s, h) => s + Number(h.total_amount || 0), 0);

  return (
    <div style={{ maxWidth: 800 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: "0.04em", textTransform: "uppercase", color: "#CDD5E4", marginBottom: 4 }}>
          Histori Kendaraan
        </h1>
        <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "#4E5D75" }}>
          Cari riwayat servis berdasarkan plat nomor kendaraan
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#2E3A50", display: "flex" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              placeholder="Masukkan plat nomor (contoh: B 1234 ABC)"
              className="input-field"
              style={{ paddingLeft: 42, letterSpacing: "0.08em", textTransform: "uppercase", paddingRight: query ? 40 : 16 }}
            />
            {query && (
              <button type="button" onClick={handleClear} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#2E3A50", cursor: "pointer", display: "flex" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
          <button type="submit" disabled={loading} style={{
            flexShrink: 0, background: loading ? "rgba(200,145,42,0.08)" : "#C8912A",
            border: "none", borderRadius: 8, padding: "0 24px", cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14,
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: loading ? "#C8912A" : "#06080D", transition: "all 0.2s",
          }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 14, height: 14, border: "2px solid rgba(200,145,42,0.3)", borderTop: "2px solid #C8912A", borderRadius: "50%", animation: "spinSlow 0.7s linear infinite", display: "inline-block" }} />
                Cari
              </span>
            ) : "Cari"}
          </button>
        </div>
      </form>

      {/* Vehicle Info Card */}
      {vehicle && (
        <div style={{ background: "#0C0F18", border: "1px solid #1A2035", borderTop: "2px solid #C8912A", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 26, color: "#CDD5E4", letterSpacing: "0.06em", marginBottom: 4 }}>
                {vehicle.plate_number}
              </div>
              <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 14, color: "#8A9BB0", marginBottom: 2 }}>
                {vehicle.owner_name}
              </div>
              <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#4E5D75" }}>
                {[vehicle.vehicle_brand, vehicle.vehicle_type, vehicle.vehicle_year].filter(Boolean).join(" · ")}
                {vehicle.phone && ` · ${vehicle.phone}`}
              </div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>Total Servis</div>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 20, color: "#C8912A" }}>{history.length}×</div>
              </div>
              {totalSpend > 0 && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>Total Pengeluaran</div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, color: "#52C97B" }}>{formatRp(totalSpend)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      {vehicle && (
        history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#4E5D75", fontFamily: "Barlow, sans-serif", fontSize: 14 }}>
            Kendaraan ini belum pernah servis.
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 12 }}>
              Riwayat Servis ({history.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {history.map((item, i) => (
                <HistoryCard key={item.id} item={item} index={i} />
              ))}
            </div>
          </>
        )
      )}

      {/* Empty state */}
      {!vehicle && searched && !loading && (
        <div style={{ textAlign: "center", padding: "50px 0", color: "#2E3A50" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1A2035" strokeWidth="1.5" style={{ marginBottom: 12 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, color: "#2E3A50", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Kendaraan tidak ditemukan
          </p>
        </div>
      )}

      {/* Initial state */}
      {!searched && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#2E3A50" }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#1A2035" strokeWidth="1.2" style={{ marginBottom: 14 }}>
            <rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Masukkan plat nomor untuk mencari riwayat
          </p>
        </div>
      )}
    </div>
  );
}