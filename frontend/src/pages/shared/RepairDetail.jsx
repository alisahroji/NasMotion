import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import api from "../../utils/api";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const STATUS = {
  waiting:     { label: "Menunggu",   color: "#5B8DEF" },
  in_progress: { label: "Dikerjakan", color: "#C8912A" },
  done:        { label: "Selesai",    color: "#52C97B" },
  cancelled:   { label: "Batal",      color: "#E74C3C" },
};

// ── Sparepart Row (memo) ──────────────────────────────────────
const SparepartRow = memo(({ item, canEdit, onRemove, removing }) => (
  <tr onMouseEnter={(e) => (e.currentTarget.style.background = "#111520")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      style={{ borderBottom: "1px solid #0F1218", transition: "background 0.15s" }}>
    <td style={{ padding: "12px 14px" }}>
      <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 13, color: "#CDD5E4", fontWeight: 500 }}>
        {item.sparepart_name}
      </div>
      {item.sparepart_code && (
        <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 11, color: "#2E3A50" }}>
          {item.sparepart_code}
        </div>
      )}
    </td>
    <td style={{ padding: "12px 14px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, fontWeight: 700, color: "#CDD5E4", textAlign: "center" }}>
      {item.qty} <span style={{ fontSize: 11, color: "#4E5D75", fontWeight: 400 }}>{item.unit}</span>
    </td>
    <td style={{ padding: "12px 14px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, color: "#8A9BB0", textAlign: "right" }}>
      {formatRp(item.price_snapshot)}
    </td>
    <td style={{ padding: "12px 14px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 700, color: "#C8912A", textAlign: "right" }}>
      {formatRp(Number(item.price_snapshot) * item.qty)}
    </td>
    {canEdit && (
      <td style={{ padding: "12px 14px", textAlign: "center" }}>
        <button onClick={() => onRemove(item.id)} disabled={removing === item.id} style={{
          background: "rgba(231,76,60,0.08)", border: "1px solid rgba(231,76,60,0.18)",
          borderRadius: 6, padding: "4px 10px", cursor: "pointer",
          fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: "#E74C3C",
          transition: "all 0.15s", opacity: removing === item.id ? 0.5 : 1,
        }}>
          {removing === item.id ? "..." : "Hapus"}
        </button>
      </td>
    )}
  </tr>
));
SparepartRow.displayName = "SparepartRow";

// ── RepairDetail ──────────────────────────────────────────────
export default function RepairDetail() {
  const { id }               = useParams();
  const navigate             = useNavigate();
  const { user }             = useOutletContext();
  const [queue,    setQueue] = useState(null);
  const [repairs,  setRep]   = useState([]);
  const [catalog,  setCat]   = useState([]);
  const [loading,  setLoad]  = useState(true);
  const [removing, setRem]   = useState(null);
  const [form,     setForm]  = useState({ sparepart_id: "", qty: 1 });
  const [adding,   setAdd]   = useState(false);
  const qtyRef               = useRef(null);

  const canEdit = useMemo(() =>
    (user?.role === "mekanik" || user?.role === "admin") &&
    queue?.status !== "done" && queue?.status !== "cancelled",
  [user, queue]);

  const totalSparepart = useMemo(() =>
    repairs.reduce((s, r) => s + Number(r.price_snapshot) * r.qty, 0),
  [repairs]);

  const totalService = useMemo(() =>
    (queue?.services ?? []).reduce((s, sv) => s + Number(sv.price), 0),
  [queue]);

  const fetchAll = useCallback(async () => {
    try {
      const [qRes, rRes, cRes] = await Promise.all([
        api.get(`/queues/${id}`),
        api.get(`/repairs/${id}`),
        api.get("/spareparts?is_active=true"),
      ]);
      setQueue(qRes.data.data);
      setRep(rRes.data.data);
      setCat(cRes.data.data);
    } catch {
      toast.error("Gagal memuat data perbaikan.");
    } finally {
      setLoad(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAdd = useCallback(async (e) => {
    e.preventDefault();
    if (!form.sparepart_id) { toast.error("Pilih sparepart."); return; }
    if (form.qty < 1)       { toast.error("Qty minimal 1."); return; }
    setAdd(true);
    try {
      await api.post(`/repairs/${id}/spareparts`, form);
      toast.success("Sparepart berhasil ditambahkan.");
      setForm({ sparepart_id: "", qty: 1 });
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal tambah sparepart.");
    } finally {
      setAdd(false);
    }
  }, [form, id, fetchAll]);

  const handleRemove = useCallback(async (repairId) => {
    setRem(repairId);
    try {
      await api.delete(`/repairs/spareparts/${repairId}`);
      toast.success("Sparepart dihapus. Stok dikembalikan.");
      setRep((p) => p.filter((r) => r.id !== repairId));
    } catch {
      toast.error("Gagal hapus sparepart.");
    } finally {
      setRem(null);
    }
  }, []);

  const selectedSp = useMemo(() =>
    catalog.find((c) => c.id === form.sparepart_id),
  [catalog, form.sparepart_id]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
      <div style={{ width: 32, height: 32, border: "2px solid #1A2035", borderTop: "2px solid #C8912A", borderRadius: "50%", animation: "spinSlow 0.8s linear infinite" }} />
    </div>
  );

  if (!queue) return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "#4E5D75", fontFamily: "Barlow, sans-serif" }}>
      Antrean tidak ditemukan.
    </div>
  );

  const st = STATUS[queue.status] ?? STATUS.waiting;

  return (
    <div style={{ maxWidth: 900 }}>

      {/* Back + Header */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12,
          color: "#4E5D75", letterSpacing: "0.1em", textTransform: "uppercase",
          marginBottom: 14, padding: 0,
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#C8912A")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#4E5D75")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Kembali ke Antrean
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: "0.04em", textTransform: "uppercase", color: "#CDD5E4" }}>
            Detail Perbaikan
          </h1>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: `${st.color}12`, border: `1px solid ${st.color}30`,
            borderRadius: 20, padding: "4px 12px",
            fontFamily: "Barlow Semi Condensed, sans-serif",
            fontSize: 12, fontWeight: 600, color: st.color,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.color }} />
            {st.label}
          </span>
        </div>
      </div>

      {/* Vehicle + Queue Info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }} className="repair-top">
        <div style={{ background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 12 }}>
            Informasi Kendaraan
          </div>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 24, color: "#CDD5E4", letterSpacing: "0.06em", marginBottom: 4 }}>
            {queue.plate_number}
          </div>
          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 13, color: "#8A9BB0", marginBottom: 2 }}>
            {queue.owner_name}
          </div>
          <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#4E5D75" }}>
            {[queue.vehicle_brand, queue.vehicle_type, queue.vehicle_year].filter(Boolean).join(" · ")}
          </div>
          {queue.phone && (
            <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#4E5D75", marginTop: 4 }}>
              📞 {queue.phone}
            </div>
          )}
        </div>

        <div style={{ background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 12 }}>
            Info Antrean
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 22, color: "#C8912A" }}>
              #{String(queue.queue_number).padStart(2, "0")}
            </span>
          </div>
          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12, color: "#4E5D75", marginBottom: 4 }}>
            Mekanik: <span style={{ color: "#8A9BB0" }}>{queue.mekanik_name ?? "—"}</span>
          </div>
          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12, color: "#4E5D75" }}>
            Kasir: <span style={{ color: "#8A9BB0" }}>{queue.kasir_name ?? "—"}</span>
          </div>
        </div>
      </div>

      {/* Complaint */}
      <div style={{ background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>
          Keluhan Pelanggan
        </div>
        <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, color: "#8A9BB0", lineHeight: 1.6 }}>
          {queue.complaint}
        </p>
        {queue.notes && (
          <>
            <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 14, marginBottom: 6 }}>
              Catatan Mekanik
            </div>
            <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "#8A9BB0", lineHeight: 1.6 }}>
              {queue.notes}
            </p>
          </>
        )}
      </div>

      {/* Services used */}
      {(queue.services ?? []).length > 0 && (
        <div style={{ background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>
            Jenis Servis
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {queue.services.map((sv, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #111520" }}>
                <span style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 13, color: "#CDD5E4" }}>{sv.service_name}</span>
                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, color: "#8A9BB0" }}>{formatRp(sv.price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spareparts Table */}
      <div style={{ background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 12, padding: "18px 20px", marginBottom: canEdit ? 20 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            Sparepart Digunakan
          </div>
          <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14, color: "#C8912A" }}>
            {formatRp(totalSparepart)}
          </span>
        </div>

        {repairs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#2E3A50", fontFamily: "Barlow, sans-serif", fontSize: 13 }}>
            {canEdit ? "Belum ada sparepart. Tambahkan di bawah." : "Tidak ada sparepart yang digunakan."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Nama Part","Qty","Harga/Unit","Subtotal", canEdit ? "Aksi" : null].filter(Boolean).map((h) => (
                    <th key={h} style={{ padding: "8px 14px", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2E3A50", textAlign: h === "Nama Part" ? "left" : "right", borderBottom: "1px solid #1A2035" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repairs.map((r) => (
                  <SparepartRow key={r.id} item={r} canEdit={canEdit} onRemove={handleRemove} removing={removing} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Total summary */}
        {(repairs.length > 0 || (queue.services ?? []).length > 0) && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #1A2035" }}>
            {(queue.services ?? []).length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "#4E5D75" }}>Total Servis</span>
                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, color: "#8A9BB0" }}>{formatRp(totalService)}</span>
              </div>
            )}
            {repairs.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "#4E5D75" }}>Total Sparepart</span>
                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, color: "#8A9BB0" }}>{formatRp(totalSparepart)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #1A2035", marginTop: 6 }}>
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 600, color: "#CDD5E4", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Estimasi</span>
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, fontWeight: 700, color: "#C8912A" }}>{formatRp(totalService + totalSparepart)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Add Sparepart Form */}
      {canEdit && (
        <div style={{ background: "#0C0F18", border: "1px solid #1A2035", borderTop: "2px solid rgba(200,145,42,0.3)", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16 }}>
            Tambah Sparepart
          </div>
          <form onSubmit={handleAdd} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "2 1 240px" }}>
              <label style={{ display: "block", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: "#4E5D75", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                Pilih Sparepart
              </label>
              <select
                value={form.sparepart_id}
                onChange={(e) => { setForm((p) => ({ ...p, sparepart_id: e.target.value })); qtyRef.current?.focus(); }}
                required
                style={{ width: "100%", background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 8, padding: "10px 14px", color: form.sparepart_id ? "#CDD5E4" : "#2E3A50", fontFamily: "Barlow, sans-serif", fontSize: 14, outline: "none" }}
                onFocus={(e) => (e.target.style.borderColor = "#C8912A")}
                onBlur={(e)  => (e.target.style.borderColor = "#1A2035")}
              >
                <option value="">— Pilih sparepart —</option>
                {catalog.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.stock === 0}>
                    {c.name} {c.brand ? `(${c.brand})` : ""} — Stok: {c.stock} {c.unit}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: "0 0 100px" }}>
              <label style={{ display: "block", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: "#4E5D75", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                Qty {selectedSp ? `(${selectedSp.unit})` : ""}
              </label>
              <input
                ref={qtyRef}
                type="number" min="1"
                max={selectedSp?.stock ?? 999}
                value={form.qty}
                onChange={(e) => setForm((p) => ({ ...p, qty: parseInt(e.target.value) || 1 }))}
                style={{ width: "100%", background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 8, padding: "10px 14px", color: "#CDD5E4", fontFamily: "Barlow, sans-serif", fontSize: 14, outline: "none", textAlign: "center" }}
                onFocus={(e) => (e.target.style.borderColor = "#C8912A")}
                onBlur={(e)  => (e.target.style.borderColor = "#1A2035")}
              />
            </div>

            {selectedSp && (
              <div style={{ flex: "0 0 auto", padding: "10px 0", fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, color: "#8A9BB0" }}>
                {formatRp(selectedSp.price)} / {selectedSp.unit}
              </div>
            )}

            <button type="submit" disabled={adding} style={{
              flex: "0 0 auto",
              background: adding ? "rgba(200,145,42,0.08)" : "#C8912A",
              border: "none", borderRadius: 8,
              padding: "10px 20px", cursor: adding ? "not-allowed" : "pointer",
              fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700,
              fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase",
              color: adding ? "#C8912A" : "#06080D",
              transition: "all 0.2s",
            }}>
              {adding ? "..." : "+ Tambah"}
            </button>
          </form>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) { .repair-top { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}