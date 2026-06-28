// routes/monitoring.js — GET /api/monitoring/live
const express = require("express");
const router  = express.Router();
const pool    = require("../db/connection");

// ─── GET /api/monitoring/live ─────────────────────────────────
// Returns live visitor count, zone loads, active alerts, activity feed
router.get("/live", async (req, res) => {
  try {
    const conn = await pool.getConnection();

    // 1. Count visitors currently inside (sum participant_count for groups)
    const [[liveRow]] = await conn.execute(`
      SELECT
        COALESCE(SUM(vi.participant_count), 0) AS visitors
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      WHERE v.status = 'inside'
    `);

    // 2. Zone occupancy — count active visits per zone
    const [zoneCounts] = await conn.execute(`
      SELECT
        z.id,
        z.name,
        z.capacity,
        COALESCE(SUM(vi.participant_count), 0) AS count
      FROM zones z
      LEFT JOIN visits v  ON v.current_zone_id = z.id AND v.status = 'inside'
      LEFT JOIN visitors vi ON v.visitor_id = vi.id
      GROUP BY z.id, z.name, z.capacity
      ORDER BY z.id
    `);

    const zones = zoneCounts.map(z => {
      const fill  = Math.min(99, Math.round((z.count / z.capacity) * 100));
      const level = fill >= 75 ? "High" : fill >= 45 ? "Moderate" : "Normal";
      return { name: z.name, count: Number(z.count), fill, level };
    });

    // 3. Active alert count
    const [[alertRow]] = await conn.execute(`
      SELECT COUNT(*) AS alerts FROM alerts WHERE status = 'Active'
    `);

    const visitors = Number(liveRow.visitors);
    const PARK_CAPACITY = 740; // sum of all zone capacities
    const capacity = Math.min(99, Math.round((visitors / PARK_CAPACITY) * 100));

    // 4. Recent activity feed (last 10 entries)
    const [feedRows] = await conn.execute(`
      SELECT event_time, event_text, event_type
      FROM activity_log
      ORDER BY event_time DESC
      LIMIT 10
    `);

    const activityFeed = feedRows.map(row => {
      const d    = new Date(row.event_time);
      const time = d.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", hour12: false });
      return [time, row.event_text, row.event_type];
    });

    conn.release();

    res.json({
      liveStats:    { visitors, capacity, alerts: Number(alertRow.alerts) },
      zones,
      activityFeed
    });

  } catch (err) {
    console.error("GET /monitoring/live:", err.message);
    res.status(500).json({ error: "Failed to fetch live monitoring data" });
  }
});

// ─── GET /api/monitoring/alerts ───────────────────────────────
router.get("/alerts", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(`
      SELECT a.id, a.message, a.severity, a.status, a.created_at,
             z.name AS zone_name
      FROM alerts a
      LEFT JOIN zones z ON a.zone_id = z.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `);
    conn.release();
    res.json({ alerts: rows });
  } catch (err) {
    console.error("GET /monitoring/alerts:", err.message);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// ─── PATCH /api/monitoring/alerts/:id ────────────────────────
// Resolve an alert
router.patch("/alerts/:id", async (req, res) => {
  const { id }     = req.params;
  const { status } = req.body; // "Resolved"

  if (status !== "Resolved") {
    return res.status(400).json({ error: "Only 'Resolved' status is accepted" });
  }

  try {
    const conn = await pool.getConnection();
    await conn.execute(
      "UPDATE alerts SET status = 'Resolved', resolved_at = NOW() WHERE id = ?",
      [id]
    );
    conn.release();
    res.json({ success: true });
  } catch (err) {
    console.error("PATCH /monitoring/alerts/:id:", err.message);
    res.status(500).json({ error: "Failed to update alert" });
  }
});

module.exports = router;
