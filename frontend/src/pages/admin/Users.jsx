import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { toast } from "sonner";
import api from "../../utils/api";

// ── Role config ───────────────────────────────────────────────
const ROLE = {
  admin:   { color: "#5B8DEF", bg: "rgba(91,141,239,0.10)",  label: "Administrator", badge: "#1A2E5A" },
  kasir:   { color: "#52C97B", bg: "rgba(82,201,123,0.10)",  label: "Kasir",          badge: "#1A3A2A" },
  mekanik: { color: "#C8912A", bg: "rgba(200,145,42,0.10)",  label: "Mekanik",        badge: "#3A2A0A" },
};

// ── Foto profil profesional per role (Unsplash) ───────────────
const PHOTOS = {
  admin: [
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&q=80",
  ],
  kasir: [
    "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80",
  ],
  mekanik: [
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=200&h=200&fit=crop&q=80",
    "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=200&h=200&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
    "https://images.unsplash.com/photo-1590086782792-42dd2350140d?w=200&h=200&fit=crop&q=80",
  ],
};

const getPhoto = (role, name) => {
  const pool  = PHOTOS[role] ?? PHOTOS.kasir;
  const seed  = (name || "").charCodeAt(0) || 0;
  return pool[seed % pool.length];
};

const fmtDate = (s) =>
  s ? new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ── Modal ─────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed",inset:0,zIndex:100,background:"rgba(6,8,13,0.84)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}
    onClick={(e)=>e.target===e.currentTarget&&onClose()}>
    <div style={{ background:"#0C0F18",border:"1px solid #1A2035",borderRadius:14,padding:"26px 28px 24px",width:"100%",maxWidth:460,animation:"fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) forwards" }}>
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

const Lbl = ({c="#4E5D75",children}) => (
  <label style={{ display:"block",fontFamily:"Barlow Semi Condensed, sans-serif",fontSize:11,fontWeight:600,letterSpacing:"0.16em",textTransform:"uppercase",color:c,marginBottom:7 }}>{children}</label>
);
const Inp = (props) => (
  <input {...props} style={{ width:"100%",background:"#08090D",border:"1px solid #1A2035",borderRadius:8,padding:"11px 14px",color:"#CDD5E4",fontFamily:"Barlow, sans-serif",fontSize:14,outline:"none",...(props.style||{}) }}
    onFocus={(e)=>{e.target.style.borderColor="#C8912A";e.target.style.boxShadow="0 0 0 3px rgba(200,145,42,0.10)"}}
    onBlur={(e) =>{e.target.style.borderColor="#1A2035";e.target.style.boxShadow="none"}} />
);

// ── User Card (Name Tag Style) ────────────────────────────────
const UserCard = memo(({ user, isSelf, onEdit, onToggle, onDelete, toggling, deleting }) => {
  const rc    = ROLE[user.role] ?? ROLE.kasir;
  const photo = getPhoto(user.role, user.name);

  return (
    <div style={{
      background: "#0C0F18",
      border: "1px solid #1A2035",
      borderRadius: 16,
      overflow: "hidden",
      transition: "transform 0.22s ease, box-shadow 0.22s ease",
      position: "relative",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${rc.color}20`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
    >

      {/* ── CARD HEADER — gradient + foto ────────────────── */}
      <div style={{
        height: 120,
        background: `linear-gradient(135deg, ${rc.badge} 0%, #0C0F18 100%)`,
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: 0,
      }}>
        {/* NasMotion watermark */}
        <div style={{
          position: "absolute", top: 12, left: 14,
          display: "flex", alignItems: "center", gap: 5,
          opacity: 0.4,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={rc.color} strokeWidth="2" strokeLinecap="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <span style={{ fontFamily:"Barlow Condensed, sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.14em", color:rc.color, textTransform:"uppercase" }}>
            NasMotion
          </span>
        </div>

        {/* Status dot kanan atas */}
        <div style={{ position:"absolute", top:12, right:14, display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background: user.is_active ? "#52C97B" : "#4E5D75", boxShadow: user.is_active ? "0 0 8px rgba(82,201,123,0.7)" : "none" }} />
          <span style={{ fontFamily:"Barlow Semi Condensed, sans-serif", fontSize:10, color: user.is_active ? "#52C97B" : "#4E5D75", fontWeight:600 }}>
            {user.is_active ? "Aktif" : "Nonaktif"}
          </span>
        </div>

        {/* "Self" badge */}
        {isSelf && (
          <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", background:"rgba(200,145,42,0.15)", border:"1px solid rgba(200,145,42,0.30)", borderRadius:20, padding:"2px 10px", fontFamily:"Barlow Semi Condensed, sans-serif", fontSize:10, color:"#C8912A" }}>
            Akun Anda
          </div>
        )}

        {/* Foto profil */}
        <div style={{
          position: "absolute",
          bottom: -44,
          left: "50%",
          transform: "translateX(-50%)",
          width: 90, height: 90,
          borderRadius: "50%",
          border: `3px solid ${rc.color}`,
          boxShadow: `0 0 0 4px #0C0F18, 0 8px 24px rgba(0,0,0,0.5), 0 0 20px ${rc.color}30`,
          overflow: "hidden",
          background: "#111520",
          flexShrink: 0,
        }}>
          <img
            src={photo}
            alt={user.name}
            loading="lazy"
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", filter: user.is_active ? "none" : "grayscale(70%) brightness(0.7)" }}
          />
        </div>
      </div>

      {/* ── CARD BODY ─────────────────────────────────────── */}
      <div style={{ padding: "52px 20px 18px", textAlign: "center" }}>

        {/* Nama */}
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700, fontSize: 20,
          color: "#CDD5E4", letterSpacing: "0.02em",
          marginBottom: 6,
        }}>
          {user.name}
        </div>

        {/* Role badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: rc.bg, border: `1px solid ${rc.color}30`,
          borderRadius: 20, padding: "4px 14px",
          marginBottom: 16,
        }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background:rc.color, boxShadow:`0 0 6px ${rc.color}` }} />
          <span style={{ fontFamily:"Barlow Semi Condensed, sans-serif", fontSize:12, fontWeight:700, color:rc.color, letterSpacing:"0.10em", textTransform:"uppercase" }}>
            {rc.label}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:"#111520", marginBottom:14 }} />

        {/* Detail info */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>

          {/* Email */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#08090D", borderRadius:8, padding:"8px 12px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2E3A50" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span style={{ fontFamily:"Barlow, sans-serif", fontSize:12, color:"#4E5D75", letterSpacing:"0.02em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, textAlign:"left" }}>
              {user.email}
            </span>
          </div>

          {/* Bergabung */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#08090D", borderRadius:8, padding:"8px 12px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2E3A50" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span style={{ fontFamily:"Barlow, sans-serif", fontSize:12, color:"#4E5D75", flex:1, textAlign:"left" }}>
              Bergabung {fmtDate(user.created_at)}
            </span>
          </div>

          {/* ID */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#08090D", borderRadius:8, padding:"8px 12px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2E3A50" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span style={{ fontFamily:"Barlow Condensed, sans-serif", fontSize:11, color:"#2E3A50", letterSpacing:"0.08em", flex:1, textAlign:"left", textTransform:"uppercase" }}>
              ID: {user.id?.slice(0,8).toUpperCase()}...
            </span>
          </div>
        </div>

        {/* Action buttons */}
        {!isSelf ? (
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={()=>onEdit(user)} style={{
              flex:1, background:"rgba(91,141,239,0.08)", border:"1px solid rgba(91,141,239,0.20)", borderRadius:8, padding:"9px 0", cursor:"pointer",
              fontFamily:"Barlow Semi Condensed, sans-serif", fontSize:12, fontWeight:600, color:"#5B8DEF", transition:"all 0.15s",
            }}
            onMouseEnter={(e)=>(e.currentTarget.style.background="rgba(91,141,239,0.18)")}
            onMouseLeave={(e)=>(e.currentTarget.style.background="rgba(91,141,239,0.08)")}
            >
              Edit
            </button>

            <button onClick={()=>onToggle(user.id)} disabled={toggling===user.id} style={{
              flex:1,
              background: user.is_active ? "rgba(231,76,60,0.06)" : "rgba(82,201,123,0.08)",
              border: `1px solid ${user.is_active ? "rgba(231,76,60,0.18)" : "rgba(82,201,123,0.20)"}`,
              borderRadius:8, padding:"9px 0", cursor: toggling===user.id ? "not-allowed":"pointer",
              fontFamily:"Barlow Semi Condensed, sans-serif", fontSize:12, fontWeight:600,
              color: user.is_active ? "#E74C3C" : "#52C97B",
              transition:"all 0.15s", opacity: toggling===user.id ? 0.5 : 1,
            }}
            onMouseEnter={(e)=>toggling!==user.id&&(e.currentTarget.style.opacity="0.8")}
            onMouseLeave={(e)=>(e.currentTarget.style.opacity=toggling===user.id?"0.5":"1")}
            >
              {toggling===user.id ? "..." : user.is_active ? "Nonaktifkan" : "Aktifkan"}
            </button>

            <button onClick={()=>onDelete(user.id)} disabled={deleting===user.id} style={{
              flexShrink:0, width:38,
              background:"rgba(231,76,60,0.06)", border:"1px solid rgba(231,76,60,0.15)",
              borderRadius:8, cursor: deleting===user.id ? "not-allowed":"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#E74C3C", transition:"all 0.15s",
              opacity: deleting===user.id ? 0.5 : 1,
            }}
            onMouseEnter={(e)=>deleting!==user.id&&(e.currentTarget.style.background="rgba(231,76,60,0.16)")}
            onMouseLeave={(e)=>(e.currentTarget.style.background="rgba(231,76,60,0.06)")}
            >
              {deleting===user.id ? (
                <span style={{ width:12,height:12,border:"2px solid rgba(231,76,60,0.3)",borderTop:"2px solid #E74C3C",borderRadius:"50%",animation:"spinSlow 0.7s linear infinite",display:"inline-block" }}/>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              )}
            </button>
          </div>
        ) : (
          <div style={{ textAlign:"center", fontFamily:"Barlow Semi Condensed, sans-serif", fontSize:11, color:"#2E3A50", letterSpacing:"0.12em", textTransform:"uppercase", padding:"8px 0" }}>
            Akun Anda — tidak dapat diedit di sini
          </div>
        )}
      </div>
    </div>
  );
});
UserCard.displayName = "UserCard";

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
      const [uRes, meRes] = await Promise.all([
        api.get("/users"),
        api.get("/auth/me"),
      ]);
      setUsers(uRes.data.data);
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
      d = d.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return d;
  }, [users, filter, search]);

  const counts = useMemo(() => ({
    all:     users.length,
    admin:   users.filter((u)=>u.role==="admin").length,
    kasir:   users.filter((u)=>u.role==="kasir").length,
    mekanik: users.filter((u)=>u.role==="mekanik").length,
  }), [users]);

  const handleToggle = useCallback(async (id) => {
    setTog(id);
    try {
      const res = await api.patch(`/users/${id}/toggle-status`);
      setUsers((p) => p.map((u) => u.id===id ? {...u, is_active: res.data.data.is_active} : u));
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
      setUsers((p) => p.filter((u) => u.id !== id));
    } catch { toast.error("Gagal hapus pengguna."); }
    finally { setDel(null); }
  }, []);

  const handleSave = useCallback(async (form, id) => {
    if (id) await api.put(`/users/${id}`, form);
    else    await api.post("/users", form);
    await fetchAll();
    setModal(null);
  }, [fetchAll]);

  const activeCount = useMemo(() => users.filter((u)=>u.is_active).length, [users]);

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"Barlow Condensed, sans-serif", fontWeight:700, fontSize:26, letterSpacing:"0.04em", textTransform:"uppercase", color:"#CDD5E4", marginBottom:4 }}>
            Manajemen Pengguna
          </h1>
          <p style={{ fontFamily:"Barlow, sans-serif", fontSize:13, color:"#4E5D75" }}>
            {activeCount} dari {users.length} pengguna aktif
          </p>
        </div>
        <button onClick={()=>setModal({type:"add"})} style={{ display:"flex", alignItems:"center", gap:7, background:"#C8912A", border:"none", borderRadius:8, padding:"10px 20px", cursor:"pointer", fontFamily:"Barlow Condensed, sans-serif", fontWeight:700, fontSize:14, letterSpacing:"0.08em", textTransform:"uppercase", color:"#06080D", transition:"all 0.2s" }}
          onMouseEnter={(e)=>(e.currentTarget.style.background="#DFA83C")}
          onMouseLeave={(e)=>(e.currentTarget.style.background="#C8912A")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Pengguna
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px,1fr))", gap:10, marginBottom:20 }}>
        {[
          { k:"all",     l:"Semua",    v:counts.all,     c:"#CDD5E4" },
          { k:"admin",   l:"Admin",    v:counts.admin,   c:ROLE.admin.color   },
          { k:"kasir",   l:"Kasir",    v:counts.kasir,   c:ROLE.kasir.color   },
          { k:"mekanik", l:"Mekanik",  v:counts.mekanik, c:ROLE.mekanik.color },
        ].map((s) => (
          <button key={s.k} onClick={()=>setFilter(s.k)} style={{
            background: filter===s.k ? "#0C0F18" : "rgba(12,15,24,0.5)",
            border: `1px solid ${filter===s.k ? s.c+"40" : "#1A2035"}`,
            borderBottom: filter===s.k ? `2px solid ${s.c}` : "1px solid #1A2035",
            borderRadius:10, padding:"14px 16px", cursor:"pointer",
            textAlign:"left", transition:"all 0.15s",
          }}>
            <div style={{ fontFamily:"Barlow Semi Condensed, sans-serif", fontSize:10, color:"#2E3A50", letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:6 }}>{s.l}</div>
            <div style={{ fontFamily:"Barlow Condensed, sans-serif", fontWeight:700, fontSize:24, color: filter===s.k ? s.c : "#4E5D75" }}>{s.v}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:"relative", maxWidth:380, marginBottom:24 }}>
        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#2E3A50", display:"flex" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Cari nama atau email..."
          style={{ width:"100%", background:"#0C0F18", border:"1px solid #1A2035", borderRadius:8, padding:"10px 14px 10px 36px", color:"#CDD5E4", fontFamily:"Barlow, sans-serif", fontSize:13, outline:"none" }}
          onFocus={(e)=>(e.target.style.borderColor="#C8912A")}
          onBlur={(e) =>(e.target.style.borderColor="#1A2035")}
        />
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:16 }}>
          {[1,2,3,4].map((i) => (
            <div key={i} style={{ background:"#0C0F18", border:"1px solid #1A2035", borderRadius:16, overflow:"hidden" }}>
              <div style={{ height:120, background:"#111520" }} />
              <div style={{ padding:"52px 20px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
                <div style={{ height:24, width:"60%", background:"#161C2A", borderRadius:6 }} />
                <div style={{ height:16, width:"40%", background:"#111520", borderRadius:20 }} />
                <div style={{ height:80, width:"100%", background:"#111520", borderRadius:8 }} />
                <div style={{ height:36, width:"100%", background:"#111520", borderRadius:8 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:"#2E3A50" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1A2035" strokeWidth="1.2" style={{ marginBottom:12 }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <p style={{ fontFamily:"Barlow Condensed, sans-serif", fontSize:18, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>
            Tidak ada pengguna
          </p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:16 }}>
          {filtered.map((u) => (
            <UserCard
              key={u.id}
              user={u}
              isSelf={u.id === meId}
              onEdit={(x) => setModal({ type:"edit", data:x })}
              onToggle={handleToggle}
              onDelete={handleDelete}
              toggling={toggling}
              deleting={deleting}
            />
          ))}
        </div>
      )}

      {/* Modal Add/Edit */}
      {modal && (
        <Modal title={modal.type==="edit" ? "Edit Pengguna" : "Tambah Pengguna"} onClose={()=>setModal(null)}>
          <UserForm
            item={modal.data}
            onSuccess={(form) => handleSave(form, modal.data?.id)}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}

// ── User Form ─────────────────────────────────────────────────
const UserForm = ({ item, onSuccess, onClose }) => {
  const [form,   setForm]   = useState({ name:item?.name||"", email:item?.email||"", role:item?.role||"kasir", password:"" });
  const [saving, setSaving] = useState(false);
  const upd = (k) => (e) => setForm((p) => ({...p, [k]: e.target.value}));
  const rc = ROLE[form.role] ?? ROLE.kasir;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error("Nama dan email wajib diisi."); return; }
    if (!item && !form.password)   { toast.error("Password wajib diisi untuk pengguna baru."); return; }
    if (form.password && form.password.length < 6) { toast.error("Password minimal 6 karakter."); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await onSuccess(payload);
      toast.success(item ? "Pengguna diupdate." : "Pengguna ditambahkan.");
    } catch (err) { toast.error(err.response?.data?.message || "Gagal menyimpan."); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Preview foto */}
      <div style={{ display:"flex", alignItems:"center", gap:14, background:"#08090D", border:"1px solid #1A2035", borderRadius:10, padding:"12px 16px", marginBottom:20 }}>
        <div style={{ width:52, height:52, borderRadius:"50%", border:`2px solid ${rc.color}`, overflow:"hidden", flexShrink:0 }}>
          <img src={getPhoto(form.role, form.name)} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }} />
        </div>
        <div>
          <div style={{ fontFamily:"Barlow Condensed, sans-serif", fontWeight:700, fontSize:16, color:"#CDD5E4" }}>
            {form.name || "Nama Pengguna"}
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:4, background:rc.bg, border:`1px solid ${rc.color}25`, borderRadius:20, padding:"2px 10px", marginTop:3 }}>
            <span style={{ width:4, height:4, borderRadius:"50%", background:rc.color }} />
            <span style={{ fontFamily:"Barlow Semi Condensed, sans-serif", fontSize:10, fontWeight:600, color:rc.color, letterSpacing:"0.10em", textTransform:"uppercase" }}>{rc.label}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom:14 }}><Lbl>Nama Lengkap *</Lbl><Inp value={form.name} onChange={upd("name")} placeholder="Nama lengkap" required /></div>
      <div style={{ marginBottom:14 }}><Lbl>Email *</Lbl><Inp type="email" value={form.email} onChange={upd("email")} placeholder="email@nasmotion.com" required /></div>

      <div style={{ marginBottom:14 }}>
        <Lbl>Role</Lbl>
        <div style={{ display:"flex", gap:8 }}>
          {["kasir","mekanik"].map((r) => {
            const rr = ROLE[r];
            const sel = form.role === r;
            return (
              <button key={r} type="button" onClick={()=>setForm((p)=>({...p,role:r}))} style={{
                flex:1, background: sel ? rr.bg : "transparent",
                border: `1px solid ${sel ? rr.color : "#1A2035"}`,
                borderRadius:8, padding:"10px 0", cursor:"pointer",
                fontFamily:"Barlow Semi Condensed, sans-serif", fontSize:12, fontWeight:600,
                color: sel ? rr.color : "#4E5D75", transition:"all 0.15s",
              }}>
                {rr.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom:20 }}>
        <Lbl>{item ? "Password Baru (kosongkan jika tidak diubah)" : "Password *"}</Lbl>
        <Inp type="password" value={form.password} onChange={upd("password")} placeholder={item ? "••••••••" : "Min. 6 karakter"} minLength={form.password ? 6 : undefined} required={!item} />
      </div>

      <button type="submit" disabled={saving} style={{ width:"100%", background:saving?"rgba(200,145,42,0.08)":"#C8912A", border:"none", borderRadius:8, padding:"13px", cursor:saving?"not-allowed":"pointer", fontFamily:"Barlow Condensed, sans-serif", fontWeight:700, fontSize:15, letterSpacing:"0.08em", textTransform:"uppercase", color:saving?"#C8912A":"#06080D", transition:"all 0.2s" }}>
        {saving ? "Menyimpan..." : item ? "Simpan Perubahan" : "Tambah Pengguna"}
      </button>
    </form>
  );
};
