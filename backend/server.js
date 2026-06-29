require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const { requireAuth }    = require("./middleware/auth");
const authRoutes         = require("./routes/auth");
const monitoringRoutes   = require("./routes/monitoring");
const analyticsRoutes    = require("./routes/analytics");
const visitorsRoutes     = require("./routes/visitors");
const reportsRoutes      = require("./routes/reports");
const overviewRoutes     = require("./routes/overview");
const registrationRoutes = require("./routes/registration");

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────
const corsOptions = {
  origin: true,
  methods: ["GET","POST","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

// ─── Health check (public) ────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Auth routes (public — no requireAuth) ────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/registration", registrationRoutes);

// ─── Protected routes (require valid staff token) ─────────────
app.use("/api/monitoring", requireAuth, monitoringRoutes);
app.use("/api/analytics",  requireAuth, analyticsRoutes);
app.use("/api/visitors",   requireAuth, visitorsRoutes);
app.use("/api/reports",    requireAuth, reportsRoutes);
app.use("/api/overview",   requireAuth, overviewRoutes);

// ─── 404 fallback ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ─── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🌿 Taman Botani Monitoring API running on http://localhost:${PORT}`);
  console.log(`   Health:   GET  http://localhost:${PORT}/api/health`);
  console.log(`   Login:    POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   Overview: GET  http://localhost:${PORT}/api/overview  (auth required)\n`);
  console.log(`   Demo credentials: admin / tbj2026  OR  demo / demo123`);
  console.log(`   (Tokens now expire — see TOKEN_TTL in .env, default 8h)\n`);
});
