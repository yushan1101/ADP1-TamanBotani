// routes/visitors.js — GET /api/visitors
const express = require("express");
const router  = express.Router();
const pool    = require("../db/connection");

// ─── GET /api/visitors ────────────────────────────────────────
// Returns visitor records in the shape VisitorRecordsPage expects:
// { rows: [[id, name, purpose, status, zone, time, tag]], summary, total }
router.get("/", async (req, res) => {
  const { type, date, purpose, search, dateFrom, dateTo } = req.query;

  // Build WHERE clauses
  const conditions = [];
  const params     = [];

  // Date filter
  if (date === "Custom range" && dateFrom && dateTo) {
    conditions.push("DATE(v.check_in_time) BETWEEN ? AND ?");
    params.push(dateFrom, dateTo);
  } else if (!date || date === "Today") {
    conditions.push("DATE(v.check_in_time) = CURDATE()");
  } else if (date === "Yesterday") {
    conditions.push("DATE(v.check_in_time) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)");
  } else if (date === "Last 7 days") {
    conditions.push("v.check_in_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
  } else if (date === "This month") {
    conditions.push("MONTH(v.check_in_time) = MONTH(NOW()) AND YEAR(v.check_in_time) = YEAR(NOW())");
  }

  // Type filter
  if (type === "Individual") { conditions.push("vi.visitor_type = 'Individual'"); }
  else if (type === "Group")  { conditions.push("vi.visitor_type = 'Group'"); }

  // Purpose filter
  if (purpose && purpose !== "All purposes") {
    conditions.push("vi.purpose = ?");
    params.push(purpose);
  }

  // Search filter (name or id)
  if (search) {
    conditions.push("(vi.name LIKE ? OR vi.id LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const conn = await pool.getConnection();

    const [rows] = await conn.execute(`
      SELECT
        vi.id,
        vi.name,
        vi.purpose,
        vi.visitor_type,
        vi.race,
        vi.participant_count,
        v.status,
        z.name   AS zone,
        v.check_in_time,
        v.check_out_time,
        v.entry_method,
        v.tag,
        v.id AS visit_id
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      LEFT JOIN zones z ON v.current_zone_id = z.id
      ${whereClause}
      ORDER BY v.check_in_time DESC
      LIMIT 100
    `, params);

    // Transform to the [id, name, purpose, status, zone, time, tag] tuple
    // that VisitorTable and VisitorRecordsPage expect
    const visitorRows = rows.map(r => {
      const t   = new Date(r.check_in_time);
      const time = t.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", hour12: false });
      const displayStatus = r.status === "inside" ? "Inside" : "Exited";
      return [
        r.id,
        r.name,
        r.purpose || "Recreation",
        displayStatus,
        r.zone || "Main Gate",
        time,
        r.tag || "Normal"
      ];
    });

    // Purpose summary for the RatioBar sidebar
    const [purposeRows] = await conn.execute(`
      SELECT vi.purpose, COUNT(*) AS cnt
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      ${whereClause}
      GROUP BY vi.purpose
      ORDER BY cnt DESC
    `, params);
    const purposeTotal = purposeRows.reduce((s,r) => s + Number(r.cnt), 0) || 1;
    const purposeSummary = purposeRows.slice(0,4).map(r => ({
      label: r.purpose,
      value: Math.round((Number(r.cnt) / purposeTotal) * 100)
    }));

    conn.release();

    res.json({ visitorRows, purposeSummary, total: rows.length });

  } catch (err) {
    console.error("GET /visitors:", err.message);
    res.status(500).json({ error: "Failed to fetch visitor records" });
  }
});

// ─── GET /api/visitors/:id ─────────────────────────────────────
// Full visitor detail for the expanded panel
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await pool.getConnection();

    // Visitor profile
    const [[visitor]] = await conn.execute(
      "SELECT * FROM visitors WHERE id = ?", [id]
    );
    if (!visitor) {
      conn.release();
      return res.status(404).json({ error: "Visitor not found" });
    }

    // All visits for this visitor
    const [visits] = await conn.execute(`
      SELECT v.id, v.check_in_time, v.check_out_time, v.status,
             v.entry_method, v.tag, z.name AS zone
      FROM visits v
      LEFT JOIN zones z ON v.current_zone_id = z.id
      WHERE v.visitor_id = ?
      ORDER BY v.check_in_time DESC
      LIMIT 10
    `, [id]);

    conn.release();
    res.json({ visitor, visits });

  } catch (err) {
    console.error("GET /visitors/:id:", err.message);
    res.status(500).json({ error: "Failed to fetch visitor detail" });
  }
});

module.exports = router;