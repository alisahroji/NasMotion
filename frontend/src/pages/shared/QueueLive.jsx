import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../utils/api";

// ── Satu foto mekanik untuk semua card (konsisten) ────────────
const CARD_PHOTO = "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=700&q=80";

// ── Status config ─────────────────────────────────────────────
const STATUS = {
  waiting:     { label: "Menunggu",   color: "#5B8DEF", glow: "rgba(91,141,239,0.5)"   },
  in_progress: { label: "Dikerjakan", color: "#C8912A", glow: "rgba(200,145,42,0.5)"   },
  done:        { label: "Selesai",    color: "#52C97B", glow: "rgba(82,201,123,0.5)"    },
  cancelled:   { label: "Batal",      color: "#E74C3C", glow: "rgba(231,76,60,0.5)"     },
};

const FILTERS = [
  { key: "all",         label: "Semua"      },
  { key: "waiting",     label: "Menunggu"   },
  { key: "in_progress", label: "Dikerjakan" },
  { key: "done",        label: "Selesai"    },
];

const timeElapsed = (s) => {
  if (!s) return null;
  const m = Math.floor((Date.now() - new Date(s)) / 60000);
  if (m < 1)  return "Baru";
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}j ${m % 60}m`;
};

// ── Action Button ─────────────────────────────────────────────
const ABtn = ({ label, color, onClick, icon }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 5,
      background: `${color}14`,
      border: `1px solid ${color}30`,
      borderRadius: 7, padding: "5px 12px",
      cursor: "pointer",
      fontFamily: "Barlow Semi Condensed, sans-serif",
      fontSize: 11, fontWeight: 600, color,
      letterSpacing: "0.06em",
      transition: "all 0.15s",
      whiteSpace: "nowrap",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = `${color}25`; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = `${color}14`; e.currentTarget.style.transform = "translateY(0)"; }}
  >
    {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
    {label}
  </button>
);

// ── Panoramic Queue Card ──────────────────────────────────────
const QueueCard = memo(({ queue, user, onAssign, onStatus, onInvoice }) => {
  const st      = STATUS[queue.status] ?? STATUS.waiting;
  const elapsed = timeElapsed(queue.started_at || queue.created_at);
  const photo   = CARD_PHOTO;

  return (
    <div
      style={{
        background: "#0C0F18",
        border: "1px solid #1A2035",
        borderRadius: 14,
        overflow: "hidden",
        transition: "transform 0.22s ease, box-shadow 0.22s ease",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${st.color}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >

      {/* ══ PANORAMIC BANNER ══════════════════════════════════ */}
      <div style={{ position: "relative", height: 160, overflow: "hidden" }}>

        {/* Foto kendaraan */}
        <img
          src={photo}
          alt={queue.vehicle_type}
          loading="lazy"
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            filter: "brightness(0.35) saturate(0.6)",
            transition: "transform 0.5s ease",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        />

        {/* Gradient overlay bawah */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(6,8,13,0.2) 0%, rgba(6,8,13,0.0) 30%, rgba(12,15,24,0.97) 100%)",
        }} />

        {/* Gradient overlay kiri untuk number */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(6,8,13,0.85) 0%, transparent 50%)",
        }} />

        {/* Status bar atas */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 3,
          background: `linear-gradient(to right, ${st.color}, transparent)`,
        }} />

        {/* Nomor antrean — overlay kiri */}
        <div style={{
          position: "absolute",
          top: "50%", left: 16,
          transform: "translateY(-60%)",
        }}>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 800,
            fontSize: 56,
            color: "#fff",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            textShadow: `0 0 30px ${st.glow}, 0 2px 8px rgba(0,0,0,0.8)`,
          }}>
            {String(queue.queue_number).padStart(2, "0")}
          </div>
          <div style={{
            fontFamily: "Barlow Semi Condensed, sans-serif",
            fontSize: 10, fontWeight: 600,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            marginTop: -2,
          }}>
            ANTREAN
          </div>
        </div>

        {/* Status badge — kanan atas */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          display: "flex", alignItems: "center", gap: 5,
          background: "rgba(6,8,13,0.75)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${st.color}40`,
          borderRadius: 20,
          padding: "4px 11px",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: st.color,
            boxShadow: `0 0 8px ${st.glow}`,
            animation: queue.status === "in_progress" ? "pulseGlow 2s ease-in-out infinite" : "none",
          }} />
          <span style={{
            fontFamily: "Barlow Semi Condensed, sans-serif",
            fontSize: 11, fontWeight: 600, color: st.color,
            letterSpacing: "0.08em",
          }}>
            {st.label}
          </span>
        </div>

        {/* Timer — kanan bawah foto */}
        {elapsed && queue.status !== "done" && queue.status !== "cancelled" && (
          <div style={{
            position: "absolute", bottom: 12, right: 12,
            display: "flex", alignItems: "center", gap: 4,
            background: "rgba(6,8,13,0.70)",
            backdropFilter: "blur(6px)",
            borderRadius: 6, padding: "3px 9px",
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
              {elapsed}
            </span>
          </div>
        )}

        {/* Tipe kendaraan — kiri bawah foto */}
        <div style={{
          position: "absolute", bottom: 12, left: 14,
          fontFamily: "Barlow Semi Condensed, sans-serif",
          fontSize: 11, fontWeight: 600,
          color: "rgba(255,255,255,0.30)",
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          {queue.vehicle_type || "Kendaraan"}
        </div>
      </div>

      {/* ══ CARD BODY ═════════════════════════════════════════ */}
      <div style={{ padding: "14px 16px 14px" }}>

        {/* Plat + Pemilik */}
        <div style={{ marginBottom: 10 }}>
          <div style={{
            display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2,
          }}>
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800, fontSize: 22,
              color: "#CDD5E4", letterSpacing: "0.06em",
            }}>
              {queue.plate_number}
            </span>
            {queue.vehicle_brand && (
              <span style={{
                fontFamily: "Barlow Semi Condensed, sans-serif",
                fontSize: 12, color: "#4E5D75",
                letterSpacing: "0.04em",
              }}>
                {queue.vehicle_brand}
              </span>
            )}
          </div>
          <div style={{
            fontFamily: "Barlow, sans-serif",
            fontSize: 12, color: "#4E5D75",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {queue.owner_name}
            {queue.phone && (
              <>
                <span style={{ color: "#1A2035" }}>·</span>
                <span>{queue.phone}</span>
              </>
            )}
          </div>
        </div>

        {/* Keluhan */}
        <div style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid #161C2A",
          borderRadius: 8, padding: "8px 11px",
          marginBottom: 12,
        }}>
          <div style={{
            fontFamily: "Barlow Semi Condensed, sans-serif",
            fontSize: 9, color: "#2E3A50",
            letterSpacing: "0.18em", textTransform: "uppercase",
            marginBottom: 4,
          }}>
            Keluhan
          </div>
          <div style={{
            fontFamily: "Barlow, sans-serif",
            fontSize: 12, color: "#8A9BB0",
            lineHeight: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {queue.complaint}
          </div>
        </div>

        {/* Mekanik info */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "Barlow, sans-serif", fontSize: 12,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2E3A50" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            {queue.mekanik_name ? (
              <span style={{ color: "#8A9BB0" }}>{queue.mekanik_name}</span>
            ) : (
              <span style={{ color: "#2E3A50", fontStyle: "italic" }}>Belum diassign</span>
            )}
          </div>

          {/* Invoice badge */}
          {queue.invoice_id && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "rgba(82,201,123,0.08)",
              border: "1px solid rgba(82,201,123,0.20)",
              borderRadius: 20, padding: "2px 9px",
              fontFamily: "Barlow Semi Condensed, sans-serif",
              fontSize: 10, fontWeight: 600, color: "#52C97B",
            }}>
              ✓ Invoice
            </span>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#111520", marginBottom: 12 }} />

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>

          {/* Admin/Kasir: Assign — hanya 1 tombol, tidak duplikat */}
          {["admin","kasir"].includes(user?.role) && queue.status === "waiting" && !queue.mekanik_id && (
            <ABtn label="Assign Mekanik" color="#5B8DEF" icon="👤" onClick={() => onAssign(queue)} />
          )}
          {["admin","kasir"].includes(user?.role) && queue.status === "waiting" && queue.mekanik_id && (
            <ABtn label="Ganti Mekanik" color="#8A9BB0" icon="🔄" onClick={() => onAssign(queue)} />
          )}

          {/* Mekanik: Mulai kerjakan */}
          {user?.role === "mekanik" && queue.status === "waiting" && queue.mekanik_id === user?.id && (
            <ABtn label="Mulai Kerjakan" color="#C8912A" icon="🔧" onClick={() => onStatus(queue, "in_progress")} />
          )}

          {/* Mekanik & Admin: Input sparepart + Selesai */}
          {(user?.role === "mekanik" || user?.role === "admin") && queue.status === "in_progress" && (
            <>
              <ABtn label="Input Sparepart" color="#A78BFA" icon="📦"
                onClick={() => window.location.href = `/perbaikan/${queue.id}`} />
              <ABtn label="Selesai" color="#52C97B" icon="✓"
                onClick={() => onStatus(queue, "done")} />
            </>
          )}

          {/* Kasir/Admin: Buat Invoice */}
          {["kasir","admin"].includes(user?.role) && queue.status === "done" && !queue.invoice_id && (
            <ABtn label="Buat Invoice" color="#52C97B" icon="🧾"
              onClick={() => onInvoice(queue)} />
          )}

          {/* Lihat detail perbaikan */}
          {["admin","kasir"].includes(user?.role) && (queue.status === "in_progress" || queue.status === "done") && (
            <ABtn label="Detail" color="#4E5D75" icon="↗"
              onClick={() => window.location.href = `/perbaikan/${queue.id}`} />
          )}

        </div>
      </div>
    </div>
  );
});
QueueCard.displayName = "QueueCard";

// ── Modal Wrapper ─────────────────────────────────────────────
const ModalWrap = ({ onClose, children }) => (
  <div
    style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(6,8,13,0.82)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div style={{
      background: "#0C0F18",
      border: "1px solid #1A2035",
      borderRadius: 14,
      padding: "26px 28px 24px",
      width: "100%", maxWidth: 480,
      maxHeight: "90vh", overflowY: "auto",
      animation: "fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) forwards",
    }}>
      {children}
    </div>
  </div>
);

const ModalTitle = ({ title, onClose }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
    <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "0.06em", textTransform: "uppercase", color: "#CDD5E4" }}>
      {title}
    </h2>
    <button onClick={onClose} style={{ background: "none", border: "none", color: "#4E5D75", cursor: "pointer", padding: 4, display: "flex" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
);

const FLbl = ({ children }) => (
  <label style={{ display: "block", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#4E5D75", marginBottom: 7 }}>
    {children}
  </label>
);

const FInp = (props) => (
  <input {...props} style={{ width: "100%", background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 8, padding: "11px 14px", color: "#CDD5E4", fontFamily: "Barlow, sans-serif", fontSize: 14, outline: "none", ...(props.style||{}) }}
    onFocus={(e) => { e.target.style.borderColor = "#C8912A"; e.target.style.boxShadow = "0 0 0 3px rgba(200,145,42,0.10)"; }}
    onBlur={(e)  => { e.target.style.borderColor = "#1A2035"; e.target.style.boxShadow = "none"; }}
  />
);

const FSelect = ({ value, onChange, children }) => (
  <select value={value} onChange={onChange} style={{ width: "100%", background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 8, padding: "11px 14px", color: "#CDD5E4", fontFamily: "Barlow, sans-serif", fontSize: 14, outline: "none" }}
    onFocus={(e) => (e.target.style.borderColor = "#C8912A")}
    onBlur={(e)  => (e.target.style.borderColor = "#1A2035")}
  >
    {children}
  </select>
);

const SubmitBtn = ({ loading, label }) => (
  <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
    {loading ? (
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{ width: 16, height: 16, border: "2px solid rgba(6,8,13,0.3)", borderTop: "2px solid #06080D", borderRadius: "50%", animation: "spinSlow 0.7s linear infinite", display: "inline-block" }} />
        Memproses...
      </span>
    ) : label}
  </button>
);

// ── Modal Tambah Antrean ──────────────────────────────────────
const AddQueueModal = ({ services, onClose, onSuccess }) => {
  const [step, setStep]           = useState(1);
  const [plate, setPlate]         = useState("");
  const [finding, setFinding]     = useState(false);
  const [vehicle, setVehicle]     = useState(null);
  const [isNew, setIsNew]         = useState(false);
  const [vForm, setVForm]         = useState({ owner_name: "", phone: "", vehicle_type: "Motor", vehicle_brand: "", vehicle_year: new Date().getFullYear() });
  const [complaint, setComplaint] = useState("");
  const [selSvc, setSelSvc]       = useState([]);
  const [saving, setSaving]       = useState(false);

  const searchPlate = async () => {
    if (!plate.trim()) { toast.error("Masukkan plat nomor."); return; }
    setFinding(true);
    try {
      const res = await api.get(`/vehicles/plate/${encodeURIComponent(plate.trim().toUpperCase())}`);
      setVehicle(res.data.data); setIsNew(false); setStep(2);
    } catch (err) {
      if (err.response?.status === 404) { setVehicle(null); setIsNew(true); setStep(2); }
      else toast.error("Gagal mencari kendaraan.");
    } finally { setFinding(false); }
  };

  const toggleSvc = (id) => setSelSvc((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaint.trim()) { toast.error("Keluhan wajib diisi."); return; }
    setSaving(true);
    try {
      let vehicleId = vehicle?.id;
      if (!vehicleId) {
        const vRes = await api.post("/vehicles", { plate_number: plate.trim().toUpperCase(), ...vForm });
        vehicleId = vRes.data.data.id;
      }
      await api.post("/queues", { vehicle_id: vehicleId, complaint, service_ids: selSvc });
      toast.success("Kendaraan berhasil didaftarkan!");
      onSuccess(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mendaftarkan.");
    } finally { setSaving(false); }
  };

  return (
    <ModalWrap onClose={onClose}>
      <ModalTitle title="Daftarkan Kendaraan" onClose={onClose} />
      {step === 1 ? (
        <div>
          <FLbl>Plat Nomor</FLbl>
          <div style={{ display: "flex", gap: 8 }}>
            <FInp value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="B 1234 ABC" onKeyDown={(e) => e.key === "Enter" && searchPlate()}
              style={{ textTransform: "uppercase", letterSpacing: "0.08em" }} />
            <button onClick={searchPlate} disabled={finding} style={{ flexShrink: 0, background: "rgba(200,145,42,0.10)", border: "1px solid rgba(200,145,42,0.25)", borderRadius: 8, padding: "0 18px", color: "#C8912A", cursor: "pointer", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
              {finding ? "..." : "Cek"}
            </button>
          </div>
          <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#2E3A50", marginTop: 8 }}>
            Sistem otomatis cek apakah kendaraan sudah pernah servis.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {vehicle ? (
            <div style={{ background: "rgba(82,201,123,0.06)", border: "1px solid rgba(82,201,123,0.15)", borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
              <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#52C97B", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>✓ Kendaraan Ditemukan</div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 18, color: "#CDD5E4" }}>{vehicle.plate_number}</div>
              <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#8A9BB0" }}>{vehicle.owner_name} · {vehicle.vehicle_brand} {vehicle.vehicle_type}</div>
            </div>
          ) : (
            <>
              <div style={{ background: "rgba(91,141,239,0.06)", border: "1px solid rgba(91,141,239,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: "#5B8DEF" }}>✦ Kendaraan baru — isi data berikut</span>
              </div>
              <div style={{ marginBottom: 14 }}><FLbl>Nama Pemilik *</FLbl><FInp value={vForm.owner_name} onChange={(e) => setVForm((p) => ({...p, owner_name: e.target.value}))} placeholder="Nama pemilik" required /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div><FLbl>Tipe Kendaraan</FLbl>
                  <FSelect value={vForm.vehicle_type} onChange={(e) => setVForm((p) => ({...p, vehicle_type: e.target.value}))}>
                    <option>Motor</option><option>Mobil</option><option>Truk</option><option>Pickup</option>
                  </FSelect>
                </div>
                <div><FLbl>Merek</FLbl><FInp value={vForm.vehicle_brand} onChange={(e) => setVForm((p) => ({...p, vehicle_brand: e.target.value}))} placeholder="Honda, Yamaha..." /></div>
              </div>
              <div style={{ marginBottom: 14 }}><FLbl>No. HP (opsional)</FLbl><FInp value={vForm.phone} onChange={(e) => setVForm((p) => ({...p, phone: e.target.value}))} placeholder="08xx" /></div>
            </>
          )}

          <div style={{ marginBottom: 14 }}>
            <FLbl>Keluhan *</FLbl>
            <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} required rows={3}
              placeholder="Deskripsikan keluhan pelanggan..."
              style={{ width: "100%", background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 8, padding: "10px 14px", color: "#CDD5E4", fontFamily: "Barlow, sans-serif", fontSize: 14, outline: "none", resize: "vertical" }}
              onFocus={(e) => { e.target.style.borderColor = "#C8912A"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#1A2035"; }}
            />
          </div>

          {services.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <FLbl>Jenis Servis (opsional)</FLbl>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {services.map((svc) => {
                  const sel = selSvc.includes(svc.id);
                  return (
                    <button key={svc.id} type="button" onClick={() => toggleSvc(svc.id)} style={{ background: sel ? "rgba(200,145,42,0.14)" : "transparent", border: `1px solid ${sel ? "#C8912A" : "#1A2035"}`, borderRadius: 20, padding: "5px 13px", cursor: "pointer", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12, color: sel ? "#C8912A" : "#4E5D75", transition: "all 0.15s" }}>
                      {svc.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setStep(1)} style={{ flexShrink: 0, background: "transparent", border: "1px solid #1A2035", borderRadius: 8, padding: "10px 16px", color: "#4E5D75", cursor: "pointer", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12 }}>
              ← Kembali
            </button>
            <div style={{ flex: 1 }}><SubmitBtn loading={saving} label="Daftarkan Kendaraan" /></div>
          </div>
        </form>
      )}
    </ModalWrap>
  );
};

// ── Modal Assign Mekanik ──────────────────────────────────────
const AssignModal = ({ queue, mechanics, onClose, onSuccess }) => {
  const [selMech, setSelMech] = useState(queue.mekanik_id ?? "");
  const [saving, setSaving]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selMech) { toast.error("Pilih mekanik."); return; }
    setSaving(true);
    try {
      await api.patch(`/queues/${queue.id}/assign`, { mekanik_id: selMech });
      toast.success("Mekanik berhasil di-assign!");
      onSuccess(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal assign mekanik.");
    } finally { setSaving(false); }
  };

  return (
    <ModalWrap onClose={onClose}>
      <ModalTitle title="Assign Mekanik" onClose={onClose} />
      <div style={{ background: "#08090D", border: "1px solid #161C2A", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 17, color: "#CDD5E4" }}>
          #{String(queue.queue_number).padStart(2,"0")} — {queue.plate_number}
        </div>
        <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#4E5D75" }}>{queue.complaint}</div>
      </div>
      <form onSubmit={handleSubmit}>
        <FLbl>Pilih Mekanik</FLbl>
        <FSelect value={selMech} onChange={(e) => setSelMech(e.target.value)}>
          <option value="">— Pilih mekanik —</option>
          {mechanics.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </FSelect>
        <SubmitBtn loading={saving} label="Assign Mekanik" />
      </form>
    </ModalWrap>
  );
};

// ── Modal Update Status ───────────────────────────────────────
const StatusModal = ({ queue, targetStatus, onClose, onSuccess }) => {
  const [notes, setNotes]   = useState("");
  const [saving, setSaving] = useState(false);
  const cfg = STATUS[targetStatus];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/queues/${queue.id}/status`, { status: targetStatus, notes });
      toast.success(`Status diubah ke "${cfg.label}"`);
      onSuccess(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal ubah status.");
    } finally { setSaving(false); }
  };

  return (
    <ModalWrap onClose={onClose}>
      <ModalTitle title="Update Status" onClose={onClose} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: `${cfg.color}0C`, border: `1px solid ${cfg.color}25`, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, color: "#CDD5E4" }}>
            #{String(queue.queue_number).padStart(2,"0")} — {queue.plate_number}
          </div>
          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12, color: cfg.color }}>
            Ubah ke: {cfg.label}
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <FLbl>Catatan (opsional)</FLbl>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          placeholder="Tambahkan catatan perbaikan..."
          style={{ width: "100%", background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 8, padding: "10px 14px", color: "#CDD5E4", fontFamily: "Barlow, sans-serif", fontSize: 14, outline: "none", resize: "vertical", marginBottom: 4 }}
          onFocus={(e) => (e.target.style.borderColor = "#C8912A")}
          onBlur={(e)  => (e.target.style.borderColor = "#1A2035")}
        />
        <SubmitBtn loading={saving} label={`Ubah ke ${cfg.label}`} />
      </form>
    </ModalWrap>
  );
};

// ── QueueLive Main ────────────────────────────────────────────
export default function QueueLive() {
  const { user }                   = useOutletContext();
  const navigate                   = useNavigate();
  const [queues,    setQueues]     = useState([]);
  const [mechanics, setMechs]      = useState([]);
  const [services,  setServices]   = useState([]);
  const [filter,    setFilter]     = useState("all");
  const [loading,   setLoading]    = useState(true);
  const [lastUpd,   setLastUpd]    = useState(null);
  const [modal,     setModal]      = useState(null);
  const intervalRef                = useRef(null);

  const fetchQueues = useCallback(async (silent = false) => {
    try {
      const res = await api.get("/queues");
      setQueues(res.data.data);
      setLastUpd(new Date());
    } catch {
      if (!silent) toast.error("Gagal memuat antrean.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const fetchSupport = useCallback(async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        api.get("/users/mechanics"),   // endpoint khusus, bisa diakses kasir
        api.get("/services?is_active=true"),
      ]);
      setMechs(mRes.data.data);
      setServices(sRes.data.data);
    } catch (err) {
      console.error("fetchSupport error:", err);
      toast.error("Gagal memuat daftar mekanik/layanan: " + (err.response?.data?.message || err.message));
    }
  }, []);

  useEffect(() => {
    fetchQueues();
    fetchSupport();
    intervalRef.current = setInterval(() => fetchQueues(true), 10000);
    return () => clearInterval(intervalRef.current);
  }, [fetchQueues, fetchSupport]);

  const refreshQueues = useCallback(() => {
    fetchQueues(true);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchQueues(true), 10000);
  }, [fetchQueues]);

  const filtered = useMemo(() =>
    filter === "all" ? queues : queues.filter((q) => q.status === filter),
  [queues, filter]);

  const counts = useMemo(() => ({
    all:         queues.length,
    waiting:     queues.filter((q) => q.status === "waiting").length,
    in_progress: queues.filter((q) => q.status === "in_progress").length,
    done:        queues.filter((q) => q.status === "done").length,
  }), [queues]);

  return (
    <div style={{ maxWidth: 1400 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: "0.04em", textTransform: "uppercase", color: "#CDD5E4" }}>
              Antrean Live
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(82,201,123,0.08)", border: "1px solid rgba(82,201,123,0.18)", borderRadius: 20, padding: "3px 10px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#52C97B", animation: "pulseGlow 2s ease-in-out infinite" }} />
              <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#52C97B", letterSpacing: "0.12em", textTransform: "uppercase" }}>Live</span>
            </div>
          </div>
          {lastUpd && (
            <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#2E3A50" }}>
              Auto-refresh 10 detik · Update {lastUpd.toLocaleTimeString("id-ID")}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={refreshQueues} style={{ display: "flex", alignItems: "center", gap: 7, background: "transparent", border: "1px solid #1A2035", borderRadius: 8, padding: "8px 14px", color: "#4E5D75", cursor: "pointer", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh
          </button>
          {["kasir","admin"].includes(user?.role) && (
            <button onClick={() => setModal({ type: "add" })} style={{ display: "flex", alignItems: "center", gap: 7, background: "#C8912A", border: "none", borderRadius: 8, padding: "8px 18px", color: "#06080D", cursor: "pointer", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Daftarkan
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 22, background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 10, padding: 4, width: "fit-content", flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const st     = STATUS[f.key];
          return (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ display: "flex", alignItems: "center", gap: 7, background: active ? "#161C2A" : "transparent", border: active ? "1px solid #1A2035" : "1px solid transparent", borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#CDD5E4" : "#4E5D75", transition: "all 0.15s" }}>
              {st && <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? st.color : "#2E3A50" }} />}
              {f.label}
              <span style={{ background: active ? "rgba(200,145,42,0.15)" : "#111520", border: active ? "1px solid rgba(200,145,42,0.25)" : "1px solid #1A2035", borderRadius: 10, padding: "1px 7px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, fontWeight: 700, color: active ? "#C8912A" : "#2E3A50" }}>
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid Cards */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} style={{ height: 340, background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 14 }}>
              <div style={{ height: 160, background: "#111520", borderRadius: "14px 14px 0 0" }} />
              <div style={{ padding: 16 }}>
                <div style={{ height: 24, width: "60%", background: "#161C2A", borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 14, width: "80%", background: "#111520", borderRadius: 6, marginBottom: 6 }} />
                <div style={{ height: 48, background: "#111520", borderRadius: 8, marginBottom: 8 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#2E3A50" }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#1A2035" strokeWidth="1.2" style={{ marginBottom: 14 }}>
            <rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, color: "#2E3A50", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {filter === "all" ? "Belum ada antrean" : `Tidak ada antrean ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()}`}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map((q) => (
            <QueueCard
              key={q.id}
              queue={q}
              user={user}
              onAssign={(queue)           => setModal({ type: "assign", queue })}
              onStatus={(queue, target)   => setModal({ type: "status", queue, targetStatus: target })}
              onInvoice={(queue)          => navigate("/invoice", { state: { queue } })}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal?.type === "add"    && <AddQueueModal services={services} onClose={() => setModal(null)} onSuccess={refreshQueues} />}
      {modal?.type === "assign" && <AssignModal queue={modal.queue} mechanics={mechanics} onClose={() => setModal(null)} onSuccess={refreshQueues} />}
      {modal?.type === "status" && <StatusModal queue={modal.queue} targetStatus={modal.targetStatus} onClose={() => setModal(null)} onSuccess={refreshQueues} />}

      <style>{`
        @media (max-width: 640px) {
          .queue-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}