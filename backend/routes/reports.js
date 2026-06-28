// routes/reports.js — /api/reports
const express = require("express");
const router  = express.Router();
const pool    = require("../db/connection");

// ─── GET /api/reports ─────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(`
      SELECT id, title, report_type, format, period_label,
             file_size, status, generated_at
      FROM reports
      ORDER BY generated_at DESC
      LIMIT 20
    `);
    conn.release();
    res.json({ reports: rows });
  } catch (err) {
    console.error("GET /reports:", err.message);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// ─── POST /api/reports/generate ──────────────────────────────
// Creates a new report record (simulates generation)
router.post("/generate", async (req, res) => {
  const { title, report_type = "Daily", format = "PDF", period_label } = req.body;

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const id   = `RPT-${Date.now().toString().slice(-6)}`;
  const size = format === "PDF"
    ? `${(Math.random() * 3 + 0.8).toFixed(1)} MB`
    : `${(Math.random() * 2 + 0.5).toFixed(1)} MB`;

  try {
    const conn = await pool.getConnection();

    // Insert as "Generating"
    await conn.execute(
      `INSERT INTO reports (id,title,report_type,format,period_label,file_size,status,generated_at)
       VALUES (?,?,?,?,?,?,?,NOW())`,
      [id, title, report_type, format, period_label || "", size, "Generating"]
    );

    // Simulate async generation — mark Ready after 2 seconds
    setTimeout(async () => {
      const c = await pool.getConnection();
      await c.execute("UPDATE reports SET status='Ready' WHERE id=?", [id]);
      c.release();
    }, 2000);

    conn.release();
    res.json({ success: true, id, status: "Generating" });

  } catch (err) {
    console.error("POST /reports/generate:", err.message);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// ─── DELETE /api/reports/:id ──────────────────────────────────
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await pool.getConnection();
    await conn.execute("DELETE FROM reports WHERE id=?", [id]);
    conn.release();
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /reports/:id:", err.message);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

module.exports = router;
