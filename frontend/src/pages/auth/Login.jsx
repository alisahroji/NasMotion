import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

const BG_URL =
  "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=1920&q=80";

const defaultRoute = (role) =>
  ({ admin: "/admin/dashboard", kasir: "/antrian", mekanik: "/antrian" }[role] ?? "/login");

export default function Login() {
  const { login }               = useAuth();
  const navigate                = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const emailRef                = useRef(null);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!email.trim() || !password.trim()) {
        toast.error("Email dan password wajib diisi.");
        return;
      }
      setLoading(true);
      try {
        const user = await login(email.trim(), password);
        toast.success(`Selamat datang, ${user.name}!`);
        navigate(defaultRoute(user.role), { replace: true });
      } catch (err) {
        toast.error(err.response?.data?.message || "Email atau password salah.");
        setPassword("");
        emailRef.current?.focus();
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, navigate]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#06080D",
        fontFamily: "Barlow, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ══════════════════════════════════════════════
          LEFT PANEL — Background & Branding
      ══════════════════════════════════════════════ */}
      <div
        style={{
          flex: "1 1 55%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "48px",
          overflow: "hidden",
          minHeight: "100vh",
        }}
        className="login-left-panel"
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${BG_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.28) saturate(0.5)",
          }}
        />

        {/* Gradient overlays */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(6,8,13,0.95) 0%, rgba(6,8,13,0.5) 50%, rgba(6,8,13,0.8) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(6,8,13,0.98) 0%, transparent 50%)",
          }}
        />

        {/* Decorative grid lines */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {[20, 45, 70].map((left) => (
            <div
              key={left}
              style={{
                position: "absolute",
                top: 0, bottom: 0,
                left: `${left}%`,
                width: "1px",
                background: "linear-gradient(to bottom, transparent, rgba(200,145,42,0.08), transparent)",
              }}
            />
          ))}
          {[25, 60].map((top) => (
            <div
              key={top}
              style={{
                position: "absolute",
                left: 0, right: 0,
                top: `${top}%`,
                height: "1px",
                background: "linear-gradient(to right, transparent, rgba(200,145,42,0.06), transparent)",
              }}
            />
          ))}
          {/* Amber glow orb */}
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "40%",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(200,145,42,0.06) 0%, transparent 70%)",
              animation: "pulseGlow 4s ease-in-out infinite",
            }}
          />
        </div>

        {/* Logo top-left */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "48px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "fadeIn 0.6s ease forwards",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(200,145,42,0.12)",
              border: "1px solid rgba(200,145,42,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WrenchSvg />
          </div>
          <span
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "22px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#CDD5E4",
            }}
          >
            Nas<span style={{ color: "#C8912A" }}>Motion</span>
          </span>
        </div>

        {/* Bottom branding text */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            animation: "fadeUp 0.7s ease forwards",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(200,145,42,0.10)",
              border: "1px solid rgba(200,145,42,0.20)",
              borderRadius: "20px",
              padding: "5px 14px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#C8912A",
                boxShadow: "0 0 8px rgba(200,145,42,0.7)",
                animation: "pulseGlow 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: "Barlow Semi Condensed, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#C8912A",
              }}
            >
              Workshop Management System
            </span>
          </div>

          <h2
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(32px, 4vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "0.02em",
              color: "#CDD5E4",
              marginBottom: "16px",
              textTransform: "uppercase",
            }}
          >
            Kelola Bengkel<br />
            <span style={{ color: "#C8912A" }}>Lebih Cerdas.</span>
          </h2>

          <p
            style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              lineHeight: 1.7,
              color: "#4E5D75",
              maxWidth: "380px",
            }}
          >
            Sistem manajemen antrean, perbaikan, sparepart, dan laporan
            bengkel dalam satu platform terintegrasi.
          </p>

          {/* Feature tags */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "28px",
            }}
          >
            {["Antrean Real-time", "Stok Sparepart", "Invoice Otomatis", "Laporan PDF"].map((f) => (
              <span
                key={f}
                style={{
                  fontFamily: "Barlow Semi Condensed, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#4E5D75",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid #1A2035",
                  borderRadius: "6px",
                  padding: "5px 12px",
                  letterSpacing: "0.06em",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          RIGHT PANEL — Login Form
      ══════════════════════════════════════════════ */}
      <div
        style={{
          flex: "0 0 420px",
          maxWidth: "420px",
          background: "#0C0F18",
          borderLeft: "1px solid #1A2035",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 40px",
          position: "relative",
        }}
        className="login-right-panel"
      >
        {/* Top accent */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "2px",
            background: "linear-gradient(to right, transparent, #C8912A, transparent)",
          }}
        />

        {/* Form header */}
        <div
          className="anim-fade-up"
          style={{ marginBottom: "36px" }}
        >
          <h1
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "28px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#CDD5E4",
              marginBottom: "8px",
            }}
          >
            Masuk ke Sistem
          </h1>
          <p
            style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: "14px",
              color: "#4E5D75",
              lineHeight: 1.6,
            }}
          >
            Masukkan kredensial akun yang diberikan oleh admin.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div
            className="anim-fade-up anim-d1"
            style={{ marginBottom: "20px" }}
          >
            <label className="label-field">Email</label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#2E3A50",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <MailSvg />
              </span>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="email@nasmotion.com"
                className="input-field"
                style={{ paddingLeft: "42px" }}
              />
            </div>
          </div>

          {/* Password */}
          <div
            className="anim-fade-up anim-d2"
            style={{ marginBottom: "28px" }}
          >
            <label className="label-field">Password</label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#2E3A50",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LockSvg />
              </span>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="input-field"
                style={{ paddingLeft: "42px", paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#2E3A50",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#C8912A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#2E3A50")}
              >
                {showPass ? <EyeOffSvg /> : <EyeSvg />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <div className="anim-fade-up anim-d3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "16px", height: "16px",
                      border: "2px solid rgba(6,8,13,0.3)",
                      borderTop: "2px solid #06080D",
                      borderRadius: "50%",
                      animation: "spinSlow 0.7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Memproses...
                </span>
              ) : (
                "Masuk ke Sistem"
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div
          className="anim-fade-up anim-d4"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "28px 0",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "#1A2035" }} />
          <span
            style={{
              fontFamily: "Barlow Semi Condensed, sans-serif",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#2E3A50",
            }}
          >
            Akses Role
          </span>
          <div style={{ flex: 1, height: "1px", background: "#1A2035" }} />
        </div>

        {/* Role badges */}
        <div
          className="anim-fade-up anim-d5"
          style={{ display: "flex", gap: "8px" }}
        >
          {[
            { label: "Admin",   dot: "#5B8DEF", desc: "Full Access"     },
            { label: "Kasir",   dot: "#52C97B", desc: "Transaksi"       },
            { label: "Mekanik", dot: "#C8912A", desc: "Perbaikan"       },
          ].map((r) => (
            <div
              key={r.label}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid #1A2035",
                borderRadius: "8px",
                padding: "10px 8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "8px", height: "8px",
                  borderRadius: "50%",
                  background: r.dot,
                  boxShadow: `0 0 8px ${r.dot}80`,
                  margin: "0 auto 6px",
                }}
              />
              <div
                style={{
                  fontFamily: "Barlow Semi Condensed, sans-serif",
                  fontWeight: 600, fontSize: "12px",
                  color: "#CDD5E4",
                  letterSpacing: "0.04em",
                }}
              >
                {r.label}
              </div>
              <div
                style={{
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "10px",
                  color: "#2E3A50",
                  marginTop: "2px",
                }}
              >
                {r.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          className="anim-fade-up anim-d6"
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            margin: "24px 0 20px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "#1A2035" }} />
          <span style={{
            fontFamily: "Barlow Semi Condensed, sans-serif",
            fontSize: "10px", letterSpacing: "0.16em",
            textTransform: "uppercase", color: "#1E2840",
          }}>
            Pelanggan?
          </span>
          <div style={{ flex: 1, height: "1px", background: "#1A2035" }} />
        </div>

        {/* Tombol Cek Status Kendaraan */}
        <a
          href="/cek"
          className="anim-fade-up anim-d6"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "8px",
            background: "transparent",
            border: "1px solid #1A2035",
            borderRadius: "8px",
            padding: "12px 16px",
            textDecoration: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            marginBottom: "24px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#C8912A";
            e.currentTarget.style.background = "rgba(200,145,42,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#1A2035";
            e.currentTarget.style.background = "transparent";
          }}
        >
          {/* Icon motor */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#C8912A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5.5" cy="17.5" r="2.5"/>
            <circle cx="18.5" cy="17.5" r="2.5"/>
            <path d="M15 17.5H8M15 6h2l3 4.5M15 6l-5 2.5-2 4M3 13.5l2-4h4"/>
          </svg>
          <span style={{
            fontFamily: "Barlow Semi Condensed, sans-serif",
            fontSize: "13px", fontWeight: 600,
            letterSpacing: "0.08em", color: "#8A9BB0",
          }}>
            Cek Status Kendaraan
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="#4E5D75" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>

        {/* Footer */}
        <p
          style={{
            fontFamily: "Barlow Semi Condensed, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#1E2840",
            textAlign: "center",
          }}
        >
          © 2025 NasMotion · Nasution Workshop
        </p>
      </div>

      {/* ── Responsive CSS ─────────────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
          .login-right-panel {
            flex: 1 1 100% !important;
            max-width: 100% !important;
            padding: 40px 24px !important;
            border-left: none !important;
            background: #06080D !important;
            justify-content: center !important;
            background-image: url(${BG_URL}) !important;
            background-size: cover !important;
            background-position: center !important;
          }
          .login-right-panel::before {
            content: '';
            position: absolute;
            inset: 0;
            background: rgba(6,8,13,0.92);
            z-index: 0;
          }
          .login-right-panel > * { position: relative; z-index: 1; }
        }
        @media (max-width: 1100px) and (min-width: 769px) {
          .login-left-panel { flex: 1 1 45% !important; padding: 32px !important; }
          .login-right-panel { flex: 0 0 380px !important; max-width: 380px !important; }
        }
      `}</style>
    </div>
  );
}

/* ── SVG Icons ──────────────────────────────────────────────── */
const WrenchSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="#C8912A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const MailSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);