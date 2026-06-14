import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../../utils/api";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);

const today = () => new Date().toISOString().slice(0,10);
const monthStart = () => { const d=new Date(); d.setDate(1); return d.toISOString().slice(0,10); };

// ── Chart Tooltip ─────────────────────────────────────────────
const Tip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:"#111520",border:"1px solid #1A2035",borderRadius:8,padding:"8px 14px" }}>
      <p style={{ fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:11,color:"#4E5D75",marginBottom:4 }}>{label}</p>
      {payload.map((p)=>(
        <p key={p.name} style={{ fontFamily:"Barlow Condensed, sans-serif",fontSize:13,color:p.color,marginBottom:2 }}>
          {p.name}: <strong>{formatRp(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Mechanic Row ──────────────────────────────────────────────
const MechRow = memo(({ item, rank }) => {
  const pct = item.total_done > 0 ? Math.round((item.total_done / Math.max(item.total_handled,1)) * 100) : 0;
  return (
    <tr onMouseEnter={(e)=>(e.currentTarget.style.background="#111520")}
        onMouseLeave={(e)=>(e.currentTarget.style.background="transparent")}
        style={{ borderBottom:"1px solid #0F1218",transition:"background 0.15s" }}>
      <td style={{ padding:"12px 14px",textAlign:"center" }}>
        <span style={{ fontFamily:"Barlow Condensed, sans-serif",fontWeight:800,fontSize:16,color:rank===1?"#C8912A":rank===2?"#8A9BB0":rank===3?"#A0785A":"#2E3A50" }}>
          #{rank}
        </span>
      </td>
      <td style={{ padding:"12px 14px",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:13,color:"#CDD5E4",fontWeight:500 }}>{item.name}</td>
      <td style={{ padding:"12px 14px",textAlign:"center",fontFamily:"Barlow Condensed, sans-serif",fontSize:15,fontWeight:700,color:"#CDD5E4" }}>{item.total_handled}</td>
      <td style={{ padding:"12px 14px",textAlign:"center",fontFamily:"Barlow Condensed, sans-serif",fontSize:15,fontWeight:700,color:"#52C97B" }}>{item.total_done}</td>
      <td style={{ padding:"12px 14px",textAlign:"center" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ flex:1,height:6,background:"#111520",borderRadius:3,overflow:"hidden" }}>
            <div style={{ height:"100%",width:`${pct}%`,background:"#C8912A",borderRadius:3,transition:"width 0.6s ease" }}/>
          </div>
          <span style={{ fontFamily:"Barlow Condensed, sans-serif",fontSize:13,color:"#C8912A",minWidth:36 }}>{pct}%</span>
        </div>
      </td>
      <td style={{ padding:"12px 14px",textAlign:"center",fontFamily:"Barlow Condensed, sans-serif",fontSize:13,color:"#4E5D75" }}>
        {item.avg_duration_minutes ? `${Math.round(item.avg_duration_minutes)} mnt` : "—"}
      </td>
    </tr>
  );
});
MechRow.displayName="MechRow";

// ── Reports ───────────────────────────────────────────────────
export default function Reports() {
  const [dateFrom,  setFrom]   = useState(monthStart());
  const [dateTo,    setTo]     = useState(today());
  const [revenue,   setRev]    = useState(null);
  const [mechanics, setMechs]  = useState([]);
  const [loading,   setLoad]   = useState(false);
  const [exporting, setExp]    = useState(null);
  const dlRef                  = useRef(null);

  const fetchData = useCallback(async () => {
    setLoad(true);
    try {
      const [revRes, mechRes] = await Promise.all([
        api.get("/reports/revenue",   { params: { date_from: dateFrom, date_to: dateTo } }),
        api.get("/reports/mechanics", { params: { date_from: dateFrom, date_to: dateTo } }),
      ]);
      setRev(revRes.data);
      setMechs(mechRes.data.data);
    } catch { toast.error("Gagal memuat laporan."); }
    finally { setLoad(false); }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = useCallback(async (format) => {
    setExp(format);
    try {
      const res = await api.get(`/reports/export/${format}`, {
        params: { date_from: dateFrom, date_to: dateTo },
        responseType: "blob",
      });
      const mimeTypes = { pdf:"application/pdf", excel:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
      const ext = format === "pdf" ? "pdf" : "xlsx";
      const blob = new Blob([res.data], { type: mimeTypes[format] });
      const url  = URL.createObjectURL(blob);
      dlRef.current.href = url;
      dlRef.current.download = `NasMotion_Laporan_${dateFrom}_${dateTo}.${ext}`;
      dlRef.current.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast.success(`File ${ext.toUpperCase()} berhasil diunduh.`);
    } catch { toast.error(`Gagal export ${format.toUpperCase()}.`); }
    finally { setExp(null); }
  }, [dateFrom, dateTo]);

  // Chart: group revenue by date
  const chartData = useMemo(() => {
    if (!revenue?.data?.length) return [];
    const grouped = {};
    revenue.data.forEach((r) => {
      const d = new Date(r.created_at).toLocaleDateString("id-ID",{day:"2-digit",month:"short"});
      grouped[d] = (grouped[d]||0) + Number(r.total_amount);
    });
    return Object.entries(grouped).map(([date,total])=>({ date, total })).slice(-14);
  }, [revenue]);

  const summary = useMemo(() => revenue?.summary ?? { total:0, total_service:0, total_sparepart:0, count:0 }, [revenue]);

  return (
    <div style={{ maxWidth:1100 }}>
      {/* Hidden download anchor */}
      <a ref={dlRef} style={{ display:"none" }} />

      {/* Header */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:24 }}>
        <h1 style={{ fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:26,letterSpacing:"0.04em",textTransform:"uppercase",color:"#CDD5E4" }}>Laporan & Ekspor</h1>
        <div style={{ display:"flex",gap:8 }}>
          <ExportBtn label="PDF" icon="📄" color="#E74C3C" loading={exporting==="pdf"} onClick={()=>handleExport("pdf")} />
          <ExportBtn label="Excel" icon="📊" color="#52C97B" loading={exporting==="excel"} onClick={()=>handleExport("excel")} />
        </div>
      </div>

      {/* Date Filter */}
      <div style={{ background:"#0C0F18",border:"1px solid #1A2035",borderRadius:12,padding:"16px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
        <span style={{ fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:11,color:"#4E5D75",letterSpacing:"0.14em",textTransform:"uppercase" }}>Periode</span>
        <input type="date" value={dateFrom} onChange={(e)=>setFrom(e.target.value)}
          style={{ background:"#0C0F18",border:"1px solid #1A2035",borderRadius:8,padding:"8px 12px",color:"#CDD5E4",fontFamily:"Barlow, sans-serif",fontSize:13,outline:"none",colorScheme:"dark" }}
          onFocus={(e)=>(e.target.style.borderColor="#C8912A")} onBlur={(e)=>(e.target.style.borderColor="#1A2035")}
        />
        <span style={{ color:"#2E3A50",fontFamily:"Barlow, sans-serif",fontSize:13 }}>s/d</span>
        <input type="date" value={dateTo} onChange={(e)=>setTo(e.target.value)}
          style={{ background:"#0C0F18",border:"1px solid #1A2035",borderRadius:8,padding:"8px 12px",color:"#CDD5E4",fontFamily:"Barlow, sans-serif",fontSize:13,outline:"none",colorScheme:"dark" }}
          onFocus={(e)=>(e.target.style.borderColor="#C8912A")} onBlur={(e)=>(e.target.style.borderColor="#1A2035")}
        />
        <button onClick={fetchData} disabled={loading} style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(200,145,42,0.10)",border:"1px solid rgba(200,145,42,0.22)",borderRadius:8,padding:"8px 16px",cursor:loading?"not-allowed":"pointer",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:12,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"#C8912A" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:loading?"spinSlow 0.8s linear infinite":"none" }}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Terapkan
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:20 }}>
        {[
          { l:"Total Pendapatan",  v:formatRp(summary.total),         c:"#C8912A" },
          { l:"Jasa Servis",       v:formatRp(summary.total_service), c:"#5B8DEF" },
          { l:"Penjualan Part",    v:formatRp(summary.total_sparepart),c:"#A78BFA" },
          { l:"Jumlah Transaksi",  v:summary.count+" trx",            c:"#52C97B" },
        ].map((s)=>(
          <div key={s.l} style={{ background:"#0C0F18",border:"1px solid #1A2035",borderLeft:`2px solid ${s.c}`,borderRadius:12,padding:"18px 20px" }}>
            <div style={{ fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:10,color:"#2E3A50",letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:8 }}>{s.l}</div>
            {loading ? <div style={{ height:26,width:"70%",background:"#161C2A",borderRadius:6 }}/> : (
              <div style={{ fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:22,color:s.c,lineHeight:1 }}>{s.v}</div>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length>0 && (
        <div style={{ background:"#0C0F18",border:"1px solid #1A2035",borderRadius:12,padding:22,marginBottom:20 }}>
          <h2 style={{ fontFamily:"Barlow Condensed, sans-serif",fontWeight:600,fontSize:15,letterSpacing:"0.06em",textTransform:"uppercase",color:"#CDD5E4",marginBottom:16 }}>
            Grafik Pendapatan
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top:5,right:5,bottom:0,left:-20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2035" vertical={false}/>
              <XAxis dataKey="date" tick={{ fill:"#4E5D75",fontSize:11,fontFamily:"Barlow Semi Condensed" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"#4E5D75",fontSize:11,fontFamily:"Barlow Semi Condensed" }} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="total" name="total" fill="#C8912A" radius={[4,4,0,0]} maxBarSize={40}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mechanic Performance */}
      <div style={{ background:"#0C0F18",border:"1px solid #1A2035",borderRadius:12,overflow:"hidden" }}>
        <div style={{ padding:"16px 20px",borderBottom:"1px solid #1A2035" }}>
          <h2 style={{ fontFamily:"Barlow Condensed, sans-serif",fontWeight:600,fontSize:15,letterSpacing:"0.06em",textTransform:"uppercase",color:"#CDD5E4" }}>
            Performa Mekanik
          </h2>
        </div>
        {loading ? (
          <div style={{ padding:20 }}>{[1,2,3].map((i)=><div key={i} style={{ height:44,background:"#111520",borderRadius:8,marginBottom:8 }}/>)}</div>
        ) : mechanics.length===0 ? (
          <div style={{ textAlign:"center",padding:"40px 0",color:"#4E5D75",fontFamily:"Barlow, sans-serif",fontSize:14 }}>Tidak ada data mekanik</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid #1A2035" }}>
                  {["Rank","Nama","Total","Selesai","Win Rate","Avg Durasi"].map((h)=>(
                    <th key={h} style={{ padding:"10px 14px",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:10,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",color:"#2E3A50",textAlign:"left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mechanics.map((m,i)=><MechRow key={m.id} item={m} rank={i+1}/>)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      {(revenue?.data?.length>0) && (
        <div style={{ background:"#0C0F18",border:"1px solid #1A2035",borderRadius:12,overflow:"hidden",marginTop:20 }}>
          <div style={{ padding:"16px 20px",borderBottom:"1px solid #1A2035",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <h2 style={{ fontFamily:"Barlow Condensed, sans-serif",fontWeight:600,fontSize:15,letterSpacing:"0.06em",textTransform:"uppercase",color:"#CDD5E4" }}>Detail Transaksi</h2>
            <span style={{ fontFamily:"Barlow, sans-serif",fontSize:12,color:"#2E3A50" }}>{revenue.data.length} transaksi</span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid #1A2035" }}>
                  {["Invoice","Tanggal","Plat","Pemilik","Kasir","Servis","Part","Total"].map((h)=>(
                    <th key={h} style={{ padding:"8px 12px",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:10,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",color:"#2E3A50",textAlign:"left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revenue.data.map((r)=>(
                  <tr key={r.id}
                    onMouseEnter={(e)=>(e.currentTarget.style.background="#111520")}
                    onMouseLeave={(e)=>(e.currentTarget.style.background="transparent")}
                    style={{ borderBottom:"1px solid #0F1218",transition:"background 0.15s" }}>
                    <td style={{ padding:"10px 12px",fontFamily:"Barlow Condensed, sans-serif",fontSize:12,fontWeight:700,color:"#C8912A" }}>{r.invoice_number}</td>
                    <td style={{ padding:"10px 12px",fontFamily:"Barlow, sans-serif",fontSize:12,color:"#4E5D75" }}>{new Date(r.created_at).toLocaleDateString("id-ID")}</td>
                    <td style={{ padding:"10px 12px",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:13,fontWeight:600,color:"#CDD5E4" }}>{r.plate_number}</td>
                    <td style={{ padding:"10px 12px",fontFamily:"Barlow, sans-serif",fontSize:12,color:"#8A9BB0" }}>{r.owner_name}</td>
                    <td style={{ padding:"10px 12px",fontFamily:"Barlow, sans-serif",fontSize:12,color:"#4E5D75" }}>{r.kasir_name}</td>
                    <td style={{ padding:"10px 12px",fontFamily:"Barlow Condensed, sans-serif",fontSize:13,color:"#8A9BB0",textAlign:"right" }}>{formatRp(r.total_service)}</td>
                    <td style={{ padding:"10px 12px",fontFamily:"Barlow Condensed, sans-serif",fontSize:13,color:"#8A9BB0",textAlign:"right" }}>{formatRp(r.total_sparepart)}</td>
                    <td style={{ padding:"10px 12px",fontFamily:"Barlow Condensed, sans-serif",fontSize:14,fontWeight:700,color:"#C8912A",textAlign:"right" }}>{formatRp(r.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const ExportBtn = ({ label, icon, color, loading, onClick }) => (
  <button onClick={onClick} disabled={loading} style={{ display:"flex",alignItems:"center",gap:7,background:`${color}10`,border:`1px solid ${color}25`,borderRadius:8,padding:"8px 16px",cursor:loading?"not-allowed":"pointer",fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:14,letterSpacing:"0.06em",textTransform:"uppercase",color,transition:"all 0.2s",opacity:loading?0.6:1 }}>
    {loading ? <span style={{ width:14,height:14,border:`2px solid ${color}30`,borderTop:`2px solid ${color}`,borderRadius:"50%",animation:"spinSlow 0.7s linear infinite",display:"inline-block" }}/> : <span>{icon}</span>}
    {loading?"Exporting...":label}
  </button>
);
