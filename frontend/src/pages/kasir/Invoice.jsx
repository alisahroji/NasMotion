import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import api from "../../utils/api";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const fmtDate = (s) => s ? new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// ── Invoice Print View (memo) ─────────────────────────────────
const PrintInvoice = memo(({ invoice }) => {
  const printRef = useRef(null);

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=800,height=600");
    win.document.write(`
      <html><head><title>Invoice ${invoice.invoice_number}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; padding: 32px; color: #1a1a2e; }
        .header { text-align: center; border-bottom: 2px solid #C8912A; padding-bottom: 16px; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
        .subtitle { font-size: 11px; color: #666; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px; }
        .inv-num { font-size: 13px; color: #C8912A; font-weight: 700; margin-top: 8px; }
        .section { margin-bottom: 16px; }
        .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 8px; font-weight: 700; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .info-item label { font-size: 10px; color: #888; text-transform: uppercase; display: block; }
        .info-item span { font-size: 13px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f5f5f5; padding: 8px; font-size: 11px; text-align: left; border-bottom: 2px solid #ddd; text-transform: uppercase; }
        td { padding: 8px; font-size: 12px; border-bottom: 1px solid #eee; }
        .total-row { font-weight: 700; background: #fdf6ec; }
        .grand-total { font-size: 16px; color: #C8912A; }
        .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px dashed #ddd; font-size: 11px; color: #888; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #e8f5e9; color: #2e7d32; }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div>
      {/* Actions */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={handlePrint} style={{
          display: "flex", alignItems: "center", gap: 7,
          background: "#C8912A", border: "none", borderRadius: 8,
          padding: "8px 18px", cursor: "pointer",
          fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700,
          fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#06080D",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Cetak Invoice
        </button>
      </div>

      {/* Invoice Preview */}
      <div ref={printRef} style={{
        background: "#fff", borderRadius: 12, padding: "28px 32px",
        color: "#1a1a2e", fontFamily: "Arial, sans-serif",
      }}>
        {/* Header */}
        <div className="header" style={{ textAlign: "center", borderBottom: "2px solid #C8912A", paddingBottom: 16, marginBottom: 20 }}>
          <div className="title" style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>
            NasMotion
          </div>
          <div className="subtitle" style={{ fontSize: 11, color: "#666", letterSpacing: 1, textTransform: "uppercase", marginTop: 3 }}>
            Bengkel Nasution Workshop
          </div>
          <div className="inv-num" style={{ fontSize: 13, color: "#C8912A", fontWeight: 700, marginTop: 8 }}>
            {invoice.invoice_number}
          </div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>
            {fmtDate(invoice.created_at)}
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#888", marginBottom: 6, fontWeight: 700 }}>Kendaraan</div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>{invoice.plate_number}</div>
            <div style={{ fontSize: 13 }}>{invoice.owner_name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{[invoice.vehicle_brand, invoice.vehicle_type].filter(Boolean).join(" ")} {invoice.vehicle_year && `(${invoice.vehicle_year})`}</div>
            {invoice.phone && <div style={{ fontSize: 12, color: "#666" }}>{invoice.phone}</div>}
          </div>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#888", marginBottom: 6, fontWeight: 700 }}>Detail</div>
            <div style={{ fontSize: 12, marginBottom: 3 }}><b>Kasir:</b> {invoice.kasir_name}</div>
            <div style={{ fontSize: 12, marginBottom: 3 }}><b>Mekanik:</b> {invoice.mekanik_name ?? "—"}</div>
            <div style={{ fontSize: 12, marginBottom: 3 }}><b>Metode:</b> {invoice.payment_method ?? "Cash"}</div>
            <div style={{ marginTop: 6 }}>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: invoice.payment_status === "paid" ? "#e8f5e9" : "#fff3e0", color: invoice.payment_status === "paid" ? "#2e7d32" : "#e65100" }}>
                {invoice.payment_status === "paid" ? "✓ LUNAS" : "BELUM LUNAS"}
              </span>
            </div>
          </div>
        </div>

        {/* Complaint */}
        {invoice.complaint && (
          <div style={{ background: "#f9f9f9", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#555" }}>
            <b>Keluhan:</b> {invoice.complaint}
          </div>
        )}

        {/* Services */}
        {(invoice.services ?? []).length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#888", marginBottom: 8, fontWeight: 700 }}>Jasa Servis</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: 8, fontSize: 11, textAlign: "left", borderBottom: "2px solid #ddd", textTransform: "uppercase" }}>Layanan</th>
                  <th style={{ padding: 8, fontSize: 11, textAlign: "right", borderBottom: "2px solid #ddd", textTransform: "uppercase" }}>Harga</th>
                </tr>
              </thead>
              <tbody>
                {invoice.services.map((s, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 8, fontSize: 13 }}>{s.service_name}</td>
                    <td style={{ padding: 8, fontSize: 13, textAlign: "right" }}>{formatRp(s.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Spareparts */}
        {(invoice.spareparts ?? []).length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#888", marginBottom: 8, fontWeight: 700 }}>Sparepart</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: 8, fontSize: 11, textAlign: "left", borderBottom: "2px solid #ddd" }}>Nama</th>
                  <th style={{ padding: 8, fontSize: 11, textAlign: "center", borderBottom: "2px solid #ddd" }}>Qty</th>
                  <th style={{ padding: 8, fontSize: 11, textAlign: "right", borderBottom: "2px solid #ddd" }}>Harga</th>
                  <th style={{ padding: 8, fontSize: 11, textAlign: "right", borderBottom: "2px solid #ddd" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {invoice.spareparts.map((s, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 8, fontSize: 13 }}>{s.sparepart_name}</td>
                    <td style={{ padding: 8, fontSize: 13, textAlign: "center" }}>{s.qty} {s.unit}</td>
                    <td style={{ padding: 8, fontSize: 13, textAlign: "right" }}>{formatRp(s.price)}</td>
                    <td style={{ padding: 8, fontSize: 13, textAlign: "right" }}>{formatRp(s.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div style={{ borderTop: "2px solid #C8912A", paddingTop: 12, marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 5 }}>
            <span>Total Jasa Servis</span><span>{formatRp(invoice.total_service)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 10 }}>
            <span>Total Sparepart</span><span>{formatRp(invoice.total_sparepart)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, color: "#C8912A" }}>
            <span>TOTAL</span><span>{formatRp(invoice.total_amount)}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 28, paddingTop: 14, borderTop: "1px dashed #ddd", fontSize: 11, color: "#aaa" }}>
          Terima kasih atas kepercayaan Anda · NasMotion Workshop
        </div>
      </div>
    </div>
  );
});
PrintInvoice.displayName = "PrintInvoice";

// ── Invoice Page ──────────────────────────────────────────────
export default function Invoice() {
  const location               = useLocation();
  const { user }               = useOutletContext();
  const [doneQueues, setDoneQ] = useState([]);
  const [selQueue,   setSelQ]  = useState(location.state?.queue?.id ?? "");
  const [invoice,    setInv]   = useState(null);
  const [existing,   setExist] = useState(null);
  const [payMethod,  setPay]   = useState("cash");
  const [notes,      setNotes] = useState("");
  const [loading,    setLoad]  = useState(true);
  const [creating,   setCreate]= useState(false);
  const [paying,     setPaying]= useState(false);
  const [tab,        setTab]   = useState("create"); // "create" | "list"
  const [invoiceList,setList]  = useState([]);
  const [listLoad,   setListL] = useState(true);

  const fetchDoneQueues = useCallback(async () => {
    try {
      const res = await api.get("/queues?status=done");
      setDoneQ(res.data.data);
    } catch { /* silent */ }
    finally { setLoad(false); }
  }, []);

  const fetchInvoiceList = useCallback(async () => {
    setListL(true);
    try {
      const res = await api.get("/invoices");
      setList(res.data.data);
    } catch { /* silent */ }
    finally { setListL(false); }
  }, []);

  useEffect(() => {
    fetchDoneQueues();
    fetchInvoiceList();
  }, [fetchDoneQueues, fetchInvoiceList]);

  // Cek invoice existing saat queue dipilih
  useEffect(() => {
    if (!selQueue) { setExist(null); setInv(null); return; }
    const q = doneQueues.find((x) => x.id === selQueue);
    if (q?.invoice_id) {
      api.get(`/invoices/${q.invoice_id}`)
        .then((r) => { setExist(r.data.data); setInv(null); })
        .catch(() => {});
    } else {
      setExist(null); setInv(null);
    }
  }, [selQueue, doneQueues]);

  const selectedQ = useMemo(() => doneQueues.find((q) => q.id === selQueue), [doneQueues, selQueue]);

  const handleCreate = useCallback(async (e) => {
    e.preventDefault();
    if (!selQueue) { toast.error("Pilih antrean terlebih dahulu."); return; }
    setCreate(true);
    try {
      const res = await api.post("/invoices", { queue_id: selQueue, payment_method: payMethod, notes });
      const detail = await api.get(`/invoices/${res.data.data.id}`);
      setInv(detail.data.data);
      toast.success(`Invoice ${res.data.data.invoice_number} berhasil dibuat!`);
      fetchDoneQueues();
      fetchInvoiceList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuat invoice.");
    } finally {
      setCreate(false);
    }
  }, [selQueue, payMethod, notes, fetchDoneQueues, fetchInvoiceList]);

  const handlePay = useCallback(async (invId) => {
    setPaying(true);
    try {
      await api.patch(`/invoices/${invId}/pay`, { payment_method: payMethod });
      toast.success("Pembayaran berhasil dicatat!");
      const detail = await api.get(`/invoices/${invId}`);
      setInv(detail.data.data);
      setExist(null);
      fetchInvoiceList();
    } catch { toast.error("Gagal catat pembayaran."); }
    finally { setPaying(false); }
  }, [payMethod, fetchInvoiceList]);

  return (
    <div style={{ maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: "0.04em", textTransform: "uppercase", color: "#CDD5E4" }}>
          Invoice & Pembayaran
        </h1>
        {/* Tabs */}
        <div style={{ display: "flex", background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 10, padding: 4, gap: 4 }}>
          {[{ key: "create", label: "Buat Invoice" }, { key: "list", label: "Riwayat Invoice" }].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: tab === t.key ? "#161C2A" : "transparent",
              border: tab === t.key ? "1px solid #1A2035" : "1px solid transparent",
              borderRadius: 7, padding: "7px 16px", cursor: "pointer",
              fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12,
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? "#CDD5E4" : "#4E5D75",
              transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {tab === "create" ? (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }} className="invoice-grid">

          {/* Left: Form */}
          <div style={{ background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 12, padding: "22px 22px 20px" }}>
            <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 18 }}>
              Buat Invoice Baru
            </div>

            <form onSubmit={handleCreate}>
              {/* Queue Select */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: "#4E5D75", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 7 }}>
                  Pilih Antrean (Selesai)
                </label>
                <select value={selQueue} onChange={(e) => setSelQ(e.target.value)} required
                  style={{ width: "100%", background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 8, padding: "10px 14px", color: selQueue ? "#CDD5E4" : "#2E3A50", fontFamily: "Barlow, sans-serif", fontSize: 14, outline: "none" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C8912A")}
                  onBlur={(e)  => (e.target.style.borderColor = "#1A2035")}
                >
                  <option value="">— Pilih antrean —</option>
                  {loading ? <option disabled>Memuat...</option> : doneQueues.map((q) => (
                    <option key={q.id} value={q.id}>
                      #{String(q.queue_number).padStart(2,"0")} · {q.plate_number} · {q.owner_name}
                      {q.invoice_id ? " ✓" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Queue Info */}
              {selectedQ && (
                <div style={{ background: "#08090D", border: "1px solid #161C2A", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, color: "#CDD5E4", marginBottom: 2 }}>
                    {selectedQ.plate_number}
                  </div>
                  <div style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#4E5D75" }}>
                    {selectedQ.owner_name} · {selectedQ.vehicle_brand} {selectedQ.vehicle_type}
                  </div>
                </div>
              )}

              {/* Existing Invoice Warning */}
              {existing && (
                <div style={{ background: "rgba(200,145,42,0.06)", border: "1px solid rgba(200,145,42,0.20)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                  <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: "#C8912A", marginBottom: 6 }}>
                    ⚠ Invoice sudah ada: {existing.invoice_number}
                  </div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, fontWeight: 700, color: "#C8912A" }}>
                    {formatRp(existing.total_amount)}
                  </div>
                  {existing.payment_status === "unpaid" && (
                    <button type="button" onClick={() => handlePay(existing.id)} disabled={paying}
                      style={{ marginTop: 10, width: "100%", background: "#52C97B", border: "none", borderRadius: 7, padding: "9px", cursor: "pointer", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#06080D" }}>
                      {paying ? "..." : "✓ Tandai Lunas"}
                    </button>
                  )}
                  {existing.payment_status === "paid" && (
                    <div style={{ marginTop: 8, fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12, color: "#52C97B" }}>✓ Sudah Lunas</div>
                  )}
                </div>
              )}

              {/* Payment method */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: "#4E5D75", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 7 }}>
                  Metode Pembayaran
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["cash", "transfer", "qris"].map((m) => (
                    <button key={m} type="button" onClick={() => setPay(m)} style={{
                      flex: 1, background: payMethod === m ? "rgba(200,145,42,0.12)" : "transparent",
                      border: `1px solid ${payMethod === m ? "#C8912A" : "#1A2035"}`,
                      borderRadius: 8, padding: "8px 0", cursor: "pointer",
                      fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 12,
                      fontWeight: 600, color: payMethod === m ? "#C8912A" : "#4E5D75",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      transition: "all 0.15s",
                    }}>{m}</button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: "#4E5D75", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 7 }}>
                  Catatan (opsional)
                </label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  placeholder="Catatan tambahan..."
                  style={{ width: "100%", background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 8, padding: "10px 14px", color: "#CDD5E4", fontFamily: "Barlow, sans-serif", fontSize: 13, outline: "none", resize: "vertical" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C8912A")}
                  onBlur={(e)  => (e.target.style.borderColor = "#1A2035")}
                />
              </div>

              {!existing && (
                <button type="submit" disabled={creating || !selQueue} style={{
                  width: "100%", background: creating || !selQueue ? "rgba(200,145,42,0.08)" : "#C8912A",
                  border: "none", borderRadius: 8, padding: "12px", cursor: creating || !selQueue ? "not-allowed" : "pointer",
                  fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 15,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: creating || !selQueue ? "#C8912A" : "#06080D",
                  transition: "all 0.2s",
                }}>
                  {creating ? "Memproses..." : "Buat Invoice"}
                </button>
              )}
            </form>
          </div>

          {/* Right: Preview */}
          <div>
            {invoice ? (
              <PrintInvoice invoice={invoice} />
            ) : existing ? (
              <PrintInvoice invoice={existing} />
            ) : (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                height: 300, background: "#0C0F18",
                border: "1px dashed #1A2035", borderRadius: 12,
                color: "#2E3A50",
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A2035" strokeWidth="1.5" style={{ marginBottom: 12 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Pilih antrean untuk preview invoice
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Invoice List */
        <div style={{ background: "#0C0F18", border: "1px solid #1A2035", borderRadius: 12, padding: "22px" }}>
          <div style={{ fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, color: "#2E3A50", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16 }}>
            Riwayat Invoice
          </div>
          {listLoad ? (
            [1,2,3].map((i) => <div key={i} style={{ height: 50, background: "#111520", borderRadius: 8, marginBottom: 8 }} />)
          ) : invoiceList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#4E5D75", fontFamily: "Barlow, sans-serif", fontSize: 14 }}>
              Belum ada invoice
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Invoice","Tanggal","Kendaraan","Pemilik","Kasir","Total","Status","Aksi"].map((h) => (
                      <th key={h} style={{ padding: "8px 12px", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#2E3A50", textAlign: "left", borderBottom: "1px solid #1A2035" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoiceList.map((inv) => (
                    <tr key={inv.id}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#111520")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      style={{ borderBottom: "1px solid #0F1218", transition: "background 0.15s" }}
                    >
                      <td style={{ padding: "12px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, fontWeight: 700, color: "#C8912A" }}>{inv.invoice_number}</td>
                      <td style={{ padding: "12px", fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#4E5D75" }}>{new Date(inv.created_at).toLocaleDateString("id-ID")}</td>
                      <td style={{ padding: "12px", fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 13, color: "#CDD5E4", fontWeight: 600 }}>{inv.plate_number}</td>
                      <td style={{ padding: "12px", fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#8A9BB0" }}>{inv.owner_name}</td>
                      <td style={{ padding: "12px", fontFamily: "Barlow, sans-serif", fontSize: 12, color: "#4E5D75" }}>{inv.kasir_name}</td>
                      <td style={{ padding: "12px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 14, fontWeight: 700, color: "#C8912A" }}>{formatRp(inv.total_amount)}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          background: inv.payment_status === "paid" ? "rgba(82,201,123,0.10)" : "rgba(200,145,42,0.10)",
                          border: `1px solid ${inv.payment_status === "paid" ? "rgba(82,201,123,0.25)" : "rgba(200,145,42,0.25)"}`,
                          borderRadius: 20, padding: "3px 10px",
                          fontFamily: "Barlow Semi Condensed, sans-serif",
                          fontSize: 11, fontWeight: 600,
                          color: inv.payment_status === "paid" ? "#52C97B" : "#C8912A",
                        }}>
                          {inv.payment_status === "paid" ? "✓ Lunas" : "Belum Lunas"}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button onClick={async () => {
                          const r = await api.get(`/invoices/${inv.id}`);
                          setInv(r.data.data); setTab("create"); setSelQ(inv.queue_id ?? "");
                        }} style={{
                          background: "rgba(200,145,42,0.08)", border: "1px solid rgba(200,145,42,0.18)",
                          borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                          fontFamily: "Barlow Semi Condensed, sans-serif", fontSize: 11, color: "#C8912A",
                        }}>
                          Lihat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .invoice-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}