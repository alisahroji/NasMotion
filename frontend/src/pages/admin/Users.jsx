import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { toast } from "sonner";
import api from "../../utils/api";

const ROLE_CFG = {
  admin:   { color:"#5B8DEF", label:"Admin"   },
  kasir:   { color:"#52C97B", label:"Kasir"   },
  mekanik: { color:"#C8912A", label:"Mekanik" },
};

const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed",inset:0,zIndex:100,background:"rgba(6,8,13,0.82)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}
    onClick={(e)=>e.target===e.currentTarget&&onClose()}>
    <div style={{ background:"#0C0F18",border:"1px solid #1A2035",borderRadius:14,padding:"26px 28px 22px",width:"100%",maxWidth:460,animation:"fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) forwards" }}>
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

// ── User Row ──────────────────────────────────────────────────
const UserRow = memo(({ user, currentUserId, onEdit, onToggle, onDelete, toggling, deleting }) => {
  const rc = ROLE_CFG[user.role] ?? ROLE_CFG.kasir;
  const isSelf = user.id === currentUserId;

  return (
    <tr onMouseEnter={(e)=>(e.currentTarget.style.background="#111520")}
        onMouseLeave={(e)=>(e.currentTarget.style.background="transparent")}
        style={{ borderBottom:"1px solid #0F1218",transition:"background 0.15s" }}>
      <td style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:34,height:34,borderRadius:"50%",background:`${rc.color}15`,border:`1px solid ${rc.color}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <span style={{ fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:14,color:rc.color }}>
              {user.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <div style={{ fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:13,color:"#CDD5E4",fontWeight:500 }}>
              {user.name}
              {isSelf&&<span style={{ fontFamily:"Barlow, sans-serif",fontSize:10,color:"#2E3A50",marginLeft:6 }}>(Anda)</span>}
            </div>
            <div style={{ fontFamily:"Barlow, sans-serif",fontSize:11,color:"#2E3A50" }}>{user.email}</div>
          </div>
        </div>
      </td>
      <td style={{ padding:"14px 16px" }}>
        <span style={{ display:"inline-flex",alignItems:"center",gap:5,background:`${rc.color}10`,border:`1px solid ${rc.color}22`,borderRadius:20,padding:"3px 11px",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:11,fontWeight:600,color:rc.color }}>
          <span style={{ width:5,height:5,borderRadius:"50%",background:rc.color }}/>
          {rc.label}
        </span>
      </td>
      <td style={{ padding:"14px 16px" }}>
        <button onClick={()=>!isSelf&&onToggle(user.id)} disabled={toggling===user.id||isSelf}
          style={{ display:"inline-flex",alignItems:"center",gap:5,background:user.is_active?"rgba(82,201,123,0.08)":"rgba(78,93,117,0.08)",border:`1px solid ${user.is_active?"rgba(82,201,123,0.20)":"rgba(78,93,117,0.15)"}`,borderRadius:20,padding:"3px 12px",cursor:isSelf||toggling===user.id?"not-allowed":"pointer",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:11,fontWeight:600,color:user.is_active?"#52C97B":"#4E5D75",transition:"all 0.2s",opacity:toggling===user.id?0.5:1 }}>
          <span style={{ width:5,height:5,borderRadius:"50%",background:user.is_active?"#52C97B":"#4E5D75" }}/>
          {user.is_active?"Aktif":"Nonaktif"}
        </button>
      </td>
      <td style={{ padding:"14px 16px",fontFamily:"Barlow, sans-serif",fontSize:12,color:"#4E5D75" }}>
        {new Date(user.created_at).toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}
      </td>
      <td style={{ padding:"14px 16px" }}>
        {!isSelf && (
          <div style={{ display:"flex",gap:6 }}>
            <SmBtn label="Edit" color="#5B8DEF" onClick={()=>onEdit(user)} />
            <SmBtn label={deleting===user.id?"...":"Hapus"} color="#E74C3C" onClick={()=>onDelete(user.id)} disabled={deleting===user.id} />
          </div>
        )}
      </td>
    </tr>
  );
});
UserRow.displayName="UserRow";

const SmBtn = ({label,color,onClick,disabled}) => (
  <button onClick={onClick} disabled={disabled} style={{ background:`${color}10`,border:`1px solid ${color}28`,borderRadius:6,padding:"4px 10px",cursor:disabled?"not-allowed":"pointer",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:11,color,transition:"all 0.15s",opacity:disabled?0.5:1 }}
    onMouseEnter={(e)=>!disabled&&(e.currentTarget.style.background=`${color}20`)}
    onMouseLeave={(e)=>!disabled&&(e.currentTarget.style.background=`${color}10`)}
  >{label}</button>
);

// ── Users Page ────────────────────────────────────────────────
export default function Users() {
  const [users,    setUsers]  = useState([]);
  const [loading,  setLoad]   = useState(true);
  const [filter,   setFilter] = useState("all");
  const [search,   setSearch] = useState("");
  const [modal,    setModal]  = useState(null);
  const [toggling, setTog]    = useState(null);
  const [deleting, setDel]    = useState(null);
  const [meId,     setMeId]   = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [usersRes, meRes] = await Promise.all([
        api.get("/users"),
        api.get("/auth/me"),
      ]);
      setUsers(usersRes.data.data);
      setMeId(meRes.data.data.id);
    } catch { toast.error("Gagal memuat pengguna."); }
    finally { setLoad(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    let d = users;
    if (filter !== "all") d = d.filter((u) => u.role === filter);
    if (search) {
      const q = search.toLowerCase();
      d = d.filter((u) => u.name.toLowerCase().includes(q)||u.email.toLowerCase().includes(q));
    }
    return d;
  }, [users, filter, search]);

  const counts = useMemo(() => ({
    all: users.length,
    admin: users.filter((u)=>u.role==="admin").length,
    kasir: users.filter((u)=>u.role==="kasir").length,
    mekanik: users.filter((u)=>u.role==="mekanik").length,
  }), [users]);

  const handleToggle = useCallback(async (id) => {
    setTog(id);
    try {
      const res = await api.patch(`/users/${id}/toggle-status`);
      setUsers((p) => p.map((u) => u.id===id ? {...u,is_active:res.data.data.is_active} : u));
      toast.success(res.data.message);
    } catch { toast.error("Gagal ubah status."); }
    finally { setTog(null); }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Hapus pengguna ini secara permanen?")) return;
    setDel(id);
    try {
      await api.delete(`/users/${id}`);
      toast.success("Pengguna dihapus.");
      setUsers((p)=>p.filter((u)=>u.id!==id));
    } catch { toast.error("Gagal hapus pengguna."); }
    finally { setDel(null); }
  }, []);

  const handleSave = useCallback(async (form, id) => {
    if (id) await api.put(`/users/${id}`, form);
    else    await api.post("/users", form);
    await fetchAll();
    setModal(null);
  }, [fetchAll]);

  return (
    <div style={{ maxWidth:1000 }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20 }}>
        <h1 style={{ fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:26,letterSpacing:"0.04em",textTransform:"uppercase",color:"#CDD5E4" }}>Manajemen Pengguna</h1>
        <button onClick={()=>setModal({type:"add"})} style={{ display:"flex",alignItems:"center",gap:7,background:"#C8912A",border:"none",borderRadius:8,padding:"9px 18px",cursor:"pointer",fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:14,letterSpacing:"0.08em",textTransform:"uppercase",color:"#06080D" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Pengguna
        </button>
      </div>

      {/* Filter + Search */}
      <div style={{ display:"flex",gap:10,marginBottom:18,flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 220px",position:"relative" }}>
          <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#2E3A50",display:"flex" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Cari nama atau email..."
            style={{ width:"100%",background:"#0C0F18",border:"1px solid #1A2035",borderRadius:8,padding:"9px 14px 9px 36px",color:"#CDD5E4",fontFamily:"Barlow, sans-serif",fontSize:13,outline:"none" }}
            onFocus={(e)=>(e.target.style.borderColor="#C8912A")} onBlur={(e)=>(e.target.style.borderColor="#1A2035")}
          />
        </div>
        <div style={{ display:"flex",background:"#0C0F18",border:"1px solid #1A2035",borderRadius:8,padding:4,gap:4,flexWrap:"wrap" }}>
          {[{k:"all",l:"Semua"},{k:"admin",l:"Admin"},{k:"kasir",l:"Kasir"},{k:"mekanik",l:"Mekanik"}].map((f)=>{
            const rc = ROLE_CFG[f.k];
            return (
              <button key={f.k} onClick={()=>setFilter(f.k)} style={{ display:"flex",alignItems:"center",gap:6,background:filter===f.k?"#161C2A":"transparent",border:filter===f.k?"1px solid #1A2035":"1px solid transparent",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:12,fontWeight:filter===f.k?600:400,color:filter===f.k?"#CDD5E4":"#4E5D75",whiteSpace:"nowrap",transition:"all 0.15s" }}>
                {rc&&<span style={{ width:5,height:5,borderRadius:"50%",background:rc.color }}/>}
                {f.l}
                <span style={{ background:filter===f.k?"rgba(200,145,42,0.12)":"#111520",border:filter===f.k?"1px solid rgba(200,145,42,0.22)":"1px solid #1A2035",borderRadius:10,padding:"1px 7px",fontFamily:"Barlow Condensed, sans-serif",fontSize:11,fontWeight:700,color:filter===f.k?"#C8912A":"#2E3A50" }}>
                  {counts[f.k]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:"#0C0F18",border:"1px solid #1A2035",borderRadius:12,overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:24 }}>{[1,2,3].map((i)=><div key={i} style={{ height:50,background:"#111520",borderRadius:8,marginBottom:8 }}/>)}</div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:"center",padding:"50px 0",color:"#4E5D75",fontFamily:"Barlow, sans-serif",fontSize:14 }}>Tidak ada pengguna</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid #1A2035" }}>
                  {["Pengguna","Role","Status","Bergabung","Aksi"].map((h)=>(
                    <th key={h} style={{ padding:"10px 16px",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:10,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",color:"#2E3A50",textAlign:"left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u)=>(
                  <UserRow key={u.id} user={u} currentUserId={meId}
                    onEdit={(x)=>setModal({type:"edit",data:x})}
                    onToggle={handleToggle} onDelete={handleDelete}
                    toggling={toggling} deleting={deleting}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding:"10px 16px",borderTop:"1px solid #1A2035",fontFamily:"Barlow, sans-serif",fontSize:12,color:"#2E3A50" }}>
          {filtered.length} dari {users.length} pengguna
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <Modal title={modal.type==="edit"?"Edit Pengguna":"Tambah Pengguna"} onClose={()=>setModal(null)}>
          <UserForm item={modal.data} onSuccess={(f)=>handleSave(f,modal.data?.id)} onClose={()=>setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

const UserForm = ({ item, onSuccess, onClose }) => {
  const [form, setForm] = useState({ name:item?.name||"", email:item?.email||"", role:item?.role||"kasir", password:"" });
  const [saving, setSaving] = useState(false);
  const upd = (k) => (e) => setForm((p)=>({...p,[k]:e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name||!form.email) { toast.error("Nama dan email wajib diisi."); return; }
    if (!item && !form.password) { toast.error("Password wajib diisi untuk pengguna baru."); return; }
    if (form.password && form.password.length<6) { toast.error("Password minimal 6 karakter."); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await onSuccess(payload);
      toast.success(item?"Pengguna diupdate.":"Pengguna ditambahkan.");
    } catch (err) { toast.error(err.response?.data?.message||"Gagal menyimpan."); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom:14 }}><Lbl>Nama Lengkap *</Lbl><Inp value={form.name} onChange={upd("name")} placeholder="Nama lengkap" required /></div>
      <div style={{ marginBottom:14 }}><Lbl>Email *</Lbl><Inp type="email" value={form.email} onChange={upd("email")} placeholder="email@nasmotion.com" required /></div>
      <div style={{ marginBottom:14 }}>
        <Lbl>Role</Lbl>
        <select value={form.role} onChange={upd("role")} style={{ width:"100%",background:"#0C0F18",border:"1px solid #1A2035",borderRadius:8,padding:"10px 14px",color:"#CDD5E4",fontFamily:"Barlow, sans-serif",fontSize:14,outline:"none" }}
          onFocus={(e)=>(e.target.style.borderColor="#C8912A")} onBlur={(e)=>(e.target.style.borderColor="#1A2035")}>
          <option value="kasir">Kasir</option>
          <option value="mekanik">Mekanik</option>
        </select>
      </div>
      <div style={{ marginBottom:20 }}>
        <Lbl>{item?"Password Baru (kosongkan jika tidak diubah)":"Password *"}</Lbl>
        <Inp type="password" value={form.password} onChange={upd("password")} placeholder={item?"••••••••":"Min. 6 karakter"} minLength={form.password?6:undefined} required={!item} />
      </div>
      <button type="submit" disabled={saving} style={{ width:"100%",background:saving?"rgba(200,145,42,0.08)":"#C8912A",border:"none",borderRadius:8,padding:"12px",cursor:saving?"not-allowed":"pointer",fontFamily:"Barlow Condensed, sans-serif",fontWeight:700,fontSize:15,letterSpacing:"0.08em",textTransform:"uppercase",color:saving?"#C8912A":"#06080D" }}>
        {saving?"Menyimpan...":item?"Simpan Perubahan":"Tambah Pengguna"}
      </button>
    </form>
  );
};
