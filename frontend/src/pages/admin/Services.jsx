import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { toast } from "sonner";
import api from "../../utils/api";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed",inset:0,zIndex:100,background:"rgba(6,8,13,0.82)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}
    onClick={(e)=>e.target===e.currentTarget&&onClose()}>
    <div style={{ background:"#0C0F18",border:"1px solid #1A2035",borderRadius:14,padding:"26px 28px 22px",width:"100%",maxWidth:480,animation:"fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) forwards" }}>
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

const Lbl = ({children}) => <label style={{ display:"block",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:11,fontWeight:600,letterSpacing:"0.16em",textTransform:"uppercase",color:"#4E5D75",marginBottom:7 }}>{children}</label>;
const Inp = (props) => (
  <input {...props} style={{ width:"100%",background:"#0C0F18",border:"1px solid #1A2035",borderRadius:8,padding:"10px 14px",color:"#CDD5E4",fontFamily:"Barlow, sans-serif",fontSize:14,outline:"none",...(props.style||{}) }}
    onFocus={(e)=>{e.target.style.borderColor="#C8912A";e.target.style.boxShadow="0 0 0 3px rgba(200,145,42,0.10)"}}
    onBlur={(e) =>{e.target.style.borderColor="#1A2035";e.target.style.boxShadow="none"}} />
);
const Btn = ({label,color,onClick,disabled}) => (
  <button onClick={onClick} disabled={disabled} style={{ background:`${color}10`,border:`1px solid ${color}28`,borderRadius:6,padding:"4px 10px",cursor:disabled?"not-allowed":"pointer",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:11,color,transition:"all 0.15s",opacity:disabled?0.5:1 }}
    onMouseEnter={(e)=>!disabled&&(e.currentTarget.style.background=`${color}20`)}
    onMouseLeave={(e)=>!disabled&&(e.currentTarget.style.background=`${color}10`)}
  >{label}</button>
);

// ── Service Row ───────────────────────────────────────────────
const SvcRow = memo(({ item, onEdit, onToggle, onDelete, toggling, deleting }) => (
  <tr onMouseEnter={(e)=>(e.currentTarget.style.background="#111520")}
      onMouseLeave={(e)=>(e.currentTarget.style.background="transparent")}
      style={{ borderBottom:"1px solid #0F1218",transition:"background 0.15s" }}>
    <td style={{ padding:"12px 14px" }}>
      <div style={{ fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:13,color:"#CDD5E4",fontWeight:500 }}>{item.name}</div>
      {item.description&&<div style={{ fontFamily:"Barlow, sans-serif",fontSize:11,color:"#2E3A50",marginTop:2 }}>{item.description}</div>}
    </td>
    <td style={{ padding:"12px 14px",fontFamily:"Barlow Condensed, sans-serif",fontSize:14,color:"#C8912A",fontWeight:700,textAlign:"right" }}>{formatRp(item.price)}</td>
    <td style={{ padding:"12px 14px",fontFamily:"Barlow, sans-serif",fontSize:12,color:"#4E5D75",textAlign:"center" }}>
      {item.duration_est} menit
    </td>
    <td style={{ padding:"12px 14px",textAlign:"center" }}>
      <button onClick={()=>onToggle(item.id)} disabled={toggling===item.id} style={{ display:"inline-flex",alignItems:"center",gap:5,background:item.is_active?"rgba(82,201,123,0.08)":"rgba(78,93,117,0.08)",border:`1px solid ${item.is_active?"rgba(82,201,123,0.20)":"rgba(78,93,117,0.15)"}`,borderRadius:20,padding:"3px 12px",cursor:"pointer",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:11,fontWeight:600,color:item.is_active?"#52C97B":"#4E5D75",transition:"all 0.2s",opacity:toggling===item.id?0.5:1 }}>
        <span style={{ width:5,height:5,borderRadius:"50%",background:item.is_active?"#52C97B":"#4E5D75" }}/>
        {item.is_active?"Aktif":"Nonaktif"}
      </button>
    </td>
    <td style={{ padding:"12px 14px" }}>
      <div style={{ display:"flex",gap:6 }}>
        <Btn label="Edit" color="#5B8DEF" onClick={()=>onEdit(item)} />
        <Btn label={deleting===item.id?"...":"Hapus"} color="#E74C3C" onClick={()=>onDelete(item.id)} disabled={deleting===item.id} />
      </div>
    </td>
  </tr>
));
SvcRow.displayName="SvcRow";

// ── Services ──────────────────────────────────────────────────
export default function Services() {
  const [items,   setItems]  = useState([]);
  const [loading, setLoad]   = useState(true);
  const [search,  setSearch] = useState("");
  const [modal,   setModal]  = useState(null);
  const [toggling,setTog]    = useState(null);
  const [deleting,setDel]    = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const res = await api.get("/services");
      setItems(res.data.data);
    } catch { toast.error("Gagal memuat layanan."); }
    finally { setLoad(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q)||(i.description||"").toLowerCase().includes(q));
  }, [items, search]);

  const handleToggle = useCallback(async (id) => {
    setTog(id);
    try {
      const res = await api.patch(`/services/${id}/toggle`);
      setItems((p) => p.map((x) => x.id===id ? { ...x, is_active: res.data.data.is_active } : x));
      toast.success(res.data.message);
    } catch { toast.error("Gagal ubah status."); }
    finally { setTog(null); }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Hapus layanan ini? Data yang sudah terkait tidak akan terpengaruh.")) return;
    setDel(id);
    try {
      await api.delete(`/services/${id}`);
      toast.success("Layanan dihapus.");
      setItems((p) => p.filter((x) => x.id!==id));
    } catch { toast.error("Gagal hapus layanan."); }
    finally { setDel(null); }
  }, []);

  const handleSave = useCallback(async (form, id) => {
    if (id) await api.put(`/services/${id}`, form);
    else    await api.post("/services", form);
    await fetchAll();
    setModal(null);
  }, [fetchAll]);

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((i)=>i.is_active).length,
    avgPrice: items.length ? items.reduce((s,i)=>s+Number(i.price),0)/items.length : 0,
  }), [items]);

  return (
    <div style={{ maxWidth:1000 }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20 }}>
        <h1 style={{ fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:26,letterSpacing:"0.04em",textTransform:"uppercase",color:"#CDD5E4" }}>Service Catalog</h1>
        <button onClick={()=>setModal({type:"add"})} style={{ display:"flex",alignItems:"center",gap:7,background:"#C8912A",border:"none",borderRadius:8,padding:"9px 18px",cursor:"pointer",fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:14,letterSpacing:"0.08em",textTransform:"uppercase",color:"#06080D" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Layanan
        </button>
      </div>

      {/* Stats mini */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20 }}>
        {[
          { l:"Total Layanan", v:stats.total,  c:"#5B8DEF" },
          { l:"Aktif",        v:stats.active, c:"#52C97B" },
          { l:"Rata-rata Harga", v:formatRp(stats.avgPrice), c:"#C8912A" },
        ].map((s)=>(
          <div key={s.l} style={{ background:"#0C0F18",border:"1px solid #1A2035",borderLeft:`2px solid ${s.c}`,borderRadius:10,padding:"14px 16px" }}>
            <div style={{ fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:10,color:"#2E3A50",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:6 }}>{s.l}</div>
            <div style={{ fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:22,color:"#CDD5E4" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:"relative",marginBottom:16,maxWidth:360 }}>
        <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#2E3A50",display:"flex" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Cari layanan..."
          style={{ width:"100%",background:"#0C0F18",border:"1px solid #1A2035",borderRadius:8,padding:"9px 14px 9px 36px",color:"#CDD5E4",fontFamily:"Barlow, sans-serif",fontSize:13,outline:"none" }}
          onFocus={(e)=>(e.target.style.borderColor="#C8912A")} onBlur={(e)=>(e.target.style.borderColor="#1A2035")}
        />
      </div>

      {/* Table */}
      <div style={{ background:"#0C0F18",border:"1px solid #1A2035",borderRadius:12,overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:24 }}>{[1,2,3].map((i)=><div key={i} style={{ height:44,background:"#111520",borderRadius:8,marginBottom:8 }}/>)}</div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:"center",padding:"50px 0",color:"#4E5D75",fontFamily:"Barlow, sans-serif",fontSize:14 }}>Tidak ada layanan</div>
        ) : (
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #1A2035" }}>
                {["Nama Layanan","Harga","Durasi","Status","Aksi"].map((h)=>(
                  <th key={h} style={{ padding:"10px 14px",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:10,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",color:"#2E3A50",textAlign:h==="Harga"?"right":"left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item)=>(
                <SvcRow key={item.id} item={item}
                  onEdit={(x)=>setModal({type:"edit",data:x})}
                  onToggle={handleToggle} onDelete={handleDelete}
                  toggling={toggling} deleting={deleting}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal title={modal.type==="edit"?"Edit Layanan":"Tambah Layanan"} onClose={()=>setModal(null)}>
          <SvcForm item={modal.data} onClose={()=>setModal(null)}
            onSuccess={(form)=>handleSave(form,modal.data?.id)}
          />
        </Modal>
      )}
    </div>
  );
}

const SvcForm = ({ item, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name:item?.name||"", description:item?.description||"", price:item?.price||0, duration_est:item?.duration_est||60 });
  const [saving,setSaving] = useState(false);
  const upd = (k) => (e) => setForm((p)=>({...p,[k]:e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error("Nama wajib diisi."); return; }
    setSaving(true);
    try { await onSuccess(form); toast.success(item?"Layanan diupdate.":"Layanan ditambahkan."); }
    catch (err) { toast.error(err.response?.data?.message||"Gagal menyimpan."); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom:14 }}><Lbl>Nama Layanan *</Lbl><Inp value={form.name} onChange={upd("name")} placeholder="Ganti Oli, Tune Up..." required /></div>
      <div style={{ marginBottom:14 }}>
        <Lbl>Deskripsi</Lbl>
        <textarea value={form.description} onChange={upd("description")} rows={2} placeholder="Deskripsi singkat..."
          style={{ width:"100%",background:"#0C0F18",border:"1px solid #1A2035",borderRadius:8,padding:"10px 14px",color:"#CDD5E4",fontFamily:"Barlow, sans-serif",fontSize:14,outline:"none",resize:"vertical" }}
          onFocus={(e)=>(e.target.style.borderColor="#C8912A")} onBlur={(e)=>(e.target.style.borderColor="#1A2035")}
        />
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14 }}>
        <div><Lbl>Harga (Rp)</Lbl><Inp type="number" min="0" value={form.price} onChange={upd("price")} /></div>
        <div><Lbl>Estimasi (menit)</Lbl><Inp type="number" min="5" value={form.duration_est} onChange={upd("duration_est")} /></div>
      </div>
      <button type="submit" disabled={saving} style={{ width:"100%",background:saving?"rgba(200,145,42,0.08)":"#C8912A",border:"none",borderRadius:8,padding:"12px",cursor:saving?"not-allowed":"pointer",fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:15,letterSpacing:"0.08em",textTransform:"uppercase",color:saving?"#C8912A":"#06080D",marginTop:6 }}>
        {saving?"Menyimpan...":item?"Simpan Perubahan":"Tambah Layanan"}
      </button>
    </form>
  );
};
