import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { toast } from "sonner";
import api from "../../utils/api";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n) || 0);

// ── Modal ─────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed",inset:0,zIndex:100,background:"rgba(6,8,13,0.82)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}
    onClick={(e) => e.target===e.currentTarget && onClose()}>
    <div style={{ background:"#0C0F18",border:"1px solid #1A2035",borderRadius:14,padding:"26px 28px 22px",width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",animation:"fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) forwards" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22 }}>
        <h2 style={{ fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:18,letterSpacing:"0.06em",textTransform:"uppercase",color:"#CDD5E4" }}>{title}</h2>
        <button onClick={onClose} style={{ background:"none",border:"none",color:"#4E5D75",cursor:"pointer",display:"flex",padding:4 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Lbl = ({ children }) => (
  <label style={{ display:"block",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:11,fontWeight:600,letterSpacing:"0.16em",textTransform:"uppercase",color:"#4E5D75",marginBottom:7 }}>
    {children}
  </label>
);

const Inp = (props) => (
  <input {...props} style={{ width:"100%",background:"#0C0F18",border:"1px solid #1A2035",borderRadius:8,padding:"10px 14px",color:"#CDD5E4",fontFamily:"Barlow, sans-serif",fontSize:14,outline:"none",...(props.style||{}) }}
    onFocus={(e)=>{e.target.style.borderColor="#C8912A";e.target.style.boxShadow="0 0 0 3px rgba(200,145,42,0.10)"}}
    onBlur={(e) =>{e.target.style.borderColor="#1A2035";e.target.style.boxShadow="none"}}
  />
);

const SaveBtn = ({ loading, label="Simpan" }) => (
  <button type="submit" disabled={loading} style={{ width:"100%",background:loading?"rgba(200,145,42,0.08)":"#C8912A",border:"none",borderRadius:8,padding:"12px",cursor:loading?"not-allowed":"pointer",fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:15,letterSpacing:"0.08em",textTransform:"uppercase",color:loading?"#C8912A":"#06080D",marginTop:6,transition:"all 0.2s" }}>
    {loading?"Menyimpan...":label}
  </button>
);

// ── SpareRow ──────────────────────────────────────────────────
const SpRow = memo(({ item, onEdit, onStock, onDelete, deleting }) => {
  const low = item.stock <= item.min_stock;
  return (
    <tr onMouseEnter={(e)=>(e.currentTarget.style.background="#111520")}
        onMouseLeave={(e)=>(e.currentTarget.style.background="transparent")}
        style={{ borderBottom:"1px solid #0F1218",transition:"background 0.15s" }}>
      <td style={{ padding:"12px 14px" }}>
        <div style={{ fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:13,color:"#CDD5E4",fontWeight:500 }}>{item.name}</div>
        {item.code&&<div style={{ fontFamily:"Barlow, sans-serif",fontSize:11,color:"#2E3A50" }}>{item.code}</div>}
      </td>
      <td style={{ padding:"12px 14px",fontFamily:"Barlow, sans-serif",fontSize:12,color:"#4E5D75" }}>{item.brand||"—"}</td>
      <td style={{ padding:"12px 14px",fontFamily:"Barlow Condensed, sans-serif",fontSize:14,color:"#8A9BB0",textAlign:"right" }}>{formatRp(item.price)}</td>
      <td style={{ padding:"12px 14px",textAlign:"center" }}>
        <button onClick={()=>onStock(item)} style={{ display:"inline-flex",alignItems:"center",gap:5,background:low?"rgba(231,76,60,0.10)":"rgba(82,201,123,0.08)",border:`1px solid ${low?"rgba(231,76,60,0.25)":"rgba(82,201,123,0.20)"}`,borderRadius:20,padding:"3px 12px",cursor:"pointer",fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:14,color:low?"#E74C3C":"#52C97B" }}>
          <span style={{ width:5,height:5,borderRadius:"50%",background:low?"#E74C3C":"#52C97B",flexShrink:0 }}/>
          {item.stock} <span style={{ fontSize:10,fontWeight:400,color:low?"#E74C3C":"#4E5D75" }}>{item.unit}</span>
        </button>
      </td>
      <td style={{ padding:"12px 14px",fontFamily:"Barlow, sans-serif",fontSize:12,color:"#4E5D75",textAlign:"center" }}>{item.min_stock}</td>
      <td style={{ padding:"12px 14px" }}>
        <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:item.is_active?"rgba(82,201,123,0.08)":"rgba(78,93,117,0.08)",border:`1px solid ${item.is_active?"rgba(82,201,123,0.20)":"rgba(78,93,117,0.15)"}`,borderRadius:20,padding:"2px 10px",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:11,fontWeight:600,color:item.is_active?"#52C97B":"#4E5D75" }}>
          {item.is_active?"Aktif":"Nonaktif"}
        </span>
      </td>
      <td style={{ padding:"12px 14px" }}>
        <div style={{ display:"flex",gap:6 }}>
          <Btn label="Edit"  color="#5B8DEF" onClick={()=>onEdit(item)} />
          <Btn label={deleting===item.id?"...":"Hapus"} color="#E74C3C" onClick={()=>onDelete(item.id)} />
        </div>
      </td>
    </tr>
  );
});
SpRow.displayName = "SpRow";

const Btn = ({ label, color, onClick }) => (
  <button onClick={onClick} style={{ background:`${color}10`,border:`1px solid ${color}28`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:11,color,transition:"all 0.15s" }}
    onMouseEnter={(e)=>(e.currentTarget.style.background=`${color}20`)}
    onMouseLeave={(e)=>(e.currentTarget.style.background=`${color}10`)}
  >{label}</button>
);

// ── Spareparts ────────────────────────────────────────────────
export default function Spareparts() {
  const [items,    setItems]  = useState([]);
  const [loading,  setLoad]   = useState(true);
  const [search,   setSearch] = useState("");
  const [filter,   setFilter] = useState("all");
  const [modal,    setModal]  = useState(null);
  const [deleting, setDel]    = useState(null);
  const [stockVal, setStockV] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      const res = await api.get("/spareparts");
      setItems(res.data.data);
    } catch { toast.error("Gagal memuat sparepart."); }
    finally { setLoad(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    let d = items;
    if (filter === "low") d = d.filter((i) => i.stock <= i.min_stock);
    if (filter === "inactive") d = d.filter((i) => !i.is_active);
    if (search) {
      const q = search.toLowerCase();
      d = d.filter((i) => i.name.toLowerCase().includes(q) || (i.code||"").toLowerCase().includes(q) || (i.brand||"").toLowerCase().includes(q));
    }
    return d;
  }, [items, filter, search]);

  const handleSave = useCallback(async (form, id) => {
    if (id) await api.put(`/spareparts/${id}`, form);
    else     await api.post("/spareparts", form);
    await fetchAll();
  }, [fetchAll]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Hapus sparepart ini?")) return;
    setDel(id);
    try {
      await api.delete(`/spareparts/${id}`);
      toast.success("Sparepart dihapus.");
      setItems((p) => p.filter((x) => x.id !== id));
    } catch { toast.error("Gagal hapus sparepart."); }
    finally { setDel(null); }
  }, []);

  const handleStockSave = useCallback(async () => {
    const v = parseInt(stockVal);
    if (isNaN(v)||v<0) { toast.error("Stok tidak valid."); return; }
    try {
      await api.patch(`/spareparts/${modal.data.id}/stock`, { stock: v });
      toast.success("Stok berhasil diupdate.");
      await fetchAll(); setModal(null);
    } catch { toast.error("Gagal update stok."); }
  }, [stockVal, modal, fetchAll]);

  return (
    <div style={{ maxWidth:1200 }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:24 }}>
        <h1 style={{ fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:26,letterSpacing:"0.04em",textTransform:"uppercase",color:"#CDD5E4" }}>Manajemen Sparepart</h1>
        <button onClick={()=>setModal({type:"add"})} style={{ display:"flex",alignItems:"center",gap:7,background:"#C8912A",border:"none",borderRadius:8,padding:"9px 18px",cursor:"pointer",fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:14,letterSpacing:"0.08em",textTransform:"uppercase",color:"#06080D" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Sparepart
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display:"flex",gap:10,marginBottom:18,flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 240px",position:"relative" }}>
          <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#2E3A50",display:"flex" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Cari nama, kode, merek..."
            style={{ width:"100%",background:"#0C0F18",border:"1px solid #1A2035",borderRadius:8,padding:"9px 14px 9px 36px",color:"#CDD5E4",fontFamily:"Barlow, sans-serif",fontSize:13,outline:"none" }}
            onFocus={(e)=>(e.target.style.borderColor="#C8912A")} onBlur={(e)=>(e.target.style.borderColor="#1A2035")}
          />
        </div>
        <div style={{ display:"flex",background:"#0C0F18",border:"1px solid #1A2035",borderRadius:8,padding:4,gap:4 }}>
          {[{k:"all",l:"Semua"},{k:"low",l:"Stok Menipis"},{k:"inactive",l:"Nonaktif"}].map((f)=>(
            <button key={f.k} onClick={()=>setFilter(f.k)} style={{ background:filter===f.k?"#161C2A":"transparent",border:filter===f.k?"1px solid #1A2035":"1px solid transparent",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:12,fontWeight:filter===f.k?600:400,color:filter===f.k?"#CDD5E4":"#4E5D75",whiteSpace:"nowrap",transition:"all 0.15s" }}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:"#0C0F18",border:"1px solid #1A2035",borderRadius:12,overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:24 }}>{[1,2,3,4].map((i)=><div key={i} style={{ height:44,background:"#111520",borderRadius:8,marginBottom:8 }}/>)}</div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:"center",padding:"50px 0",color:"#4E5D75",fontFamily:"Barlow, sans-serif",fontSize:14 }}>Tidak ada sparepart</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid #1A2035" }}>
                  {["Nama","Merek","Harga","Stok","Min Stok","Status","Aksi"].map((h)=>(
                    <th key={h} style={{ padding:"10px 14px",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:10,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",color:"#2E3A50",textAlign:h==="Harga"||h==="Stok"||h==="Min Stok"?"right":"left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item)=>(
                  <SpRow key={item.id} item={item}
                    onEdit={(x)=>setModal({type:"edit",data:x})}
                    onStock={(x)=>{setModal({type:"stock",data:x});setStockV(String(x.stock));}}
                    onDelete={handleDelete} deleting={deleting}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding:"12px 16px",borderTop:"1px solid #1A2035",fontFamily:"Barlow, sans-serif",fontSize:12,color:"#2E3A50" }}>
          {filtered.length} dari {items.length} sparepart
        </div>
      </div>

      {/* Modal Add/Edit */}
      {(modal?.type==="add"||modal?.type==="edit") && (
        <SpForm
          item={modal.type==="edit"?modal.data:null}
          onClose={()=>setModal(null)}
          onSuccess={async (form)=>{ await handleSave(form,modal.data?.id); setModal(null); }}
        />
      )}

      {/* Modal Stock */}
      {modal?.type==="stock" && (
        <Modal title={`Update Stok — ${modal.data.name}`} onClose={()=>setModal(null)}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontFamily:"Barlow, sans-serif",fontSize:13,color:"#4E5D75",marginBottom:4 }}>
              Stok saat ini: <strong style={{ color:"#CDD5E4" }}>{modal.data.stock} {modal.data.unit}</strong>
            </div>
            <div style={{ fontFamily:"Barlow, sans-serif",fontSize:12,color:"#2E3A50" }}>Min stok: {modal.data.min_stock}</div>
          </div>
          <Lbl>Stok Baru ({modal.data.unit})</Lbl>
          <Inp type="number" min="0" value={stockVal} onChange={(e)=>setStockV(e.target.value)} autoFocus />
          <button onClick={handleStockSave} style={{ width:"100%",background:"#C8912A",border:"none",borderRadius:8,padding:"12px",cursor:"pointer",fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:15,letterSpacing:"0.08em",textTransform:"uppercase",color:"#06080D",marginTop:16 }}>
            Update Stok
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── Sparepart Form ────────────────────────────────────────────
const SpForm = ({ item, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: item?.name||"", code: item?.code||"", brand: item?.brand||"",
    unit: item?.unit||"pcs", price: item?.price||0,
    stock: item?.stock||0, min_stock: item?.min_stock||5,
  });
  const [saving, setSaving] = useState(false);
  const upd = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error("Nama wajib diisi."); return; }
    setSaving(true);
    try {
      await onSuccess(form);
      toast.success(item ? "Sparepart diupdate." : "Sparepart ditambahkan.");
    } catch (err) {
      toast.error(err.response?.data?.message||"Gagal menyimpan.");
    } finally { setSaving(false); }
  };

  return (
    <Modal title={item?"Edit Sparepart":"Tambah Sparepart"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14 }}>
          <div style={{ gridColumn:"1/-1" }}><Lbl>Nama Sparepart *</Lbl><Inp value={form.name} onChange={upd("name")} placeholder="Nama sparepart" required /></div>
          <div><Lbl>Kode Part</Lbl><Inp value={form.code} onChange={upd("code")} placeholder="SP-001" /></div>
          <div><Lbl>Merek</Lbl><Inp value={form.brand} onChange={upd("brand")} placeholder="Honda, Yamaha..." /></div>
          <div>
            <Lbl>Satuan</Lbl>
            <select value={form.unit} onChange={upd("unit")} style={{ width:"100%",background:"#0C0F18",border:"1px solid #1A2035",borderRadius:8,padding:"10px 14px",color:"#CDD5E4",fontFamily:"Barlow, sans-serif",fontSize:14,outline:"none" }}>
              {["pcs","liter","set","meter","kg","buah"].map((u)=><option key={u}>{u}</option>)}
            </select>
          </div>
          <div><Lbl>Harga Jual (Rp)</Lbl><Inp type="number" min="0" value={form.price} onChange={upd("price")} /></div>
          {!item && <div><Lbl>Stok Awal</Lbl><Inp type="number" min="0" value={form.stock} onChange={upd("stock")} /></div>}
          <div><Lbl>Min Stok Alert</Lbl><Inp type="number" min="0" value={form.min_stock} onChange={upd("min_stock")} /></div>
        </div>
        <SaveBtn loading={saving} label={item?"Simpan Perubahan":"Tambah Sparepart"} />
      </form>
    </Modal>
  );
};
