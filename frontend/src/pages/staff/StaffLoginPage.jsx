import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login, setToken, setUser } from "../../api/monitoringApi";

export function StaffLoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError(null);
    try {
      const data = await login(username.trim(), password);
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Subtle botanical background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoRing}>
            <span style={{ fontSize: 28 }}>🌺</span>
          </div>
          <h1 style={styles.title}>Taman Botani Johor</h1>
          <div style={styles.dividerRow}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerDot}>✦</span>
            <span style={styles.dividerLine} />
          </div>
          <p style={styles.subtitle}>VISITOR MONITORING SYSTEM</p>
        </div>

        {/* Form panel */}
        <div style={styles.panel}>
          {error && (
            <div style={styles.errorBox}>
              <span style={{ fontSize: 14 }}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Username */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>👤</span> Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
                style={styles.input}
                onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={e => Object.assign(e.target.style, styles.input)}
              />
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🔒</span> Password
              </label>
              <div style={styles.passwordWrap}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  style={{ ...styles.input, paddingRight: 44 }}
                  onFocus={e => Object.assign(e.target.style, { ...styles.inputFocus, paddingRight: "44px" })}
                  onBlur={e => Object.assign(e.target.style, { ...styles.input, paddingRight: "44px" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={styles.eyeBtn}
                  aria-label="Toggle password"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn}
            >
              {loading ? "Signing in…" : "SIGN IN"}
            </button>
          </form>
        </div>

        {/* Demo credentials hint */}
        <p style={styles.hint}>
          Demo credentials:{" "}
          <code style={styles.code}>demo / demo123</code>
          {" "}or{" "}
          <code style={styles.code}>admin / tbj2026</code>
        </p>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, #eef4ee 0%, #f5f8f0 50%, #edf2ed 100%)",
    padding: "1.5rem",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute",
    top: "-80px",
    right: "-80px",
    width: 320,
    height: 320,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(107,143,71,0.10) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: "-60px",
    left: "-60px",
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(107,143,71,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderRadius: 28,
    border: "0.5px solid rgba(255,255,255,0.85)",
    boxShadow: "0 8px 40px rgba(74,107,42,0.10), 0 2px 8px rgba(74,107,42,0.06)",
    padding: "2.5rem 2rem 2rem",
    position: "relative",
    zIndex: 1,
  },
  header: {
    textAlign: "center",
    marginBottom: "1.75rem",
  },
  logoRing: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7aaa4e, #4a6b2a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
    boxShadow: "0 4px 20px rgba(107,143,71,0.28)",
  },
  title: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    fontSize: 22,
    fontWeight: 600,
    color: "#2d4a1e",
    margin: "0 0 0.75rem",
    letterSpacing: "-0.2px",
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    marginBottom: "0.5rem",
  },
  dividerLine: {
    display: "inline-block",
    width: 40,
    height: 0.5,
    background: "rgba(107,143,71,0.3)",
  },
  dividerDot: {
    fontSize: 10,
    color: "#7a9060",
    opacity: 0.7,
  },
  subtitle: {
    fontSize: 10.5,
    fontWeight: 500,
    color: "#7a9060",
    letterSpacing: "2.5px",
    margin: 0,
  },
  panel: {
    background: "rgba(255,255,255,0.80)",
    borderRadius: 18,
    border: "0.5px solid rgba(255,255,255,0.9)",
    padding: "1.5rem",
    marginBottom: "1rem",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(163,45,45,0.06)",
    border: "0.5px solid rgba(163,45,45,0.2)",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: "1.25rem",
    fontSize: 13,
    color: "#a32d2d",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: "#4a6b2a",
    letterSpacing: "0.3px",
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  labelIcon: {
    fontSize: 12,
  },
  input: {
    width: "100%",
    height: 44,
    background: "rgba(248,251,244,0.9)",
    border: "0.5px solid rgba(107,143,71,0.22)",
    borderRadius: 12,
    padding: "0 14px",
    fontSize: 14,
    color: "#2d4a1e",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  },
  inputFocus: {
    width: "100%",
    height: 44,
    background: "rgba(255,255,255,0.98)",
    border: "0.5px solid rgba(107,143,71,0.55)",
    borderRadius: 12,
    padding: "0 14px",
    fontSize: 14,
    color: "#2d4a1e",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  passwordWrap: {
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: 13,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#7a9060",
    display: "flex",
    alignItems: "center",
    padding: 0,
  },
  submitBtn: {
    width: "100%",
    height: 48,
    marginTop: "0.25rem",
    background: "linear-gradient(135deg, #7aaa4e, #4a6b2a)",
    border: "none",
    borderRadius: 14,
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "2px",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(74,107,42,0.30)",
    transition: "transform 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
  },
  hint: {
    textAlign: "center",
    fontSize: 11.5,
    color: "#7a9060",
    margin: 0,
  },
  code: {
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontSize: 11,
    background: "rgba(107,143,71,0.10)",
    padding: "2px 6px",
    borderRadius: 4,
    color: "#4a6b2a",
  },
};