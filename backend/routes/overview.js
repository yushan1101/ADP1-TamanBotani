// routes/overview.js — GET /api/overview
// Drives the StaffOverviewPage with real DB data.
// Returns: KPI strip, zone summary, recent alerts, today's visitor count.

const express = require("express");
const router  = express.Router();
const pool    = require("../db/connection");

router.get("/", async (req, res) => {
  try {
    const conn = await pool.getConnection();

    // ── 1. Live occupancy ─────────────────────────────────────
    const [[liveRow]] = await conn.execute(`
      SELECT COALESCE(SUM(vi.participant_count), 0) AS visitors
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      WHERE v.status = 'inside'
    `);
    const liveVisitors = Number(liveRow.visitors);
    const PARK_CAPACITY = 740;
    const liveCapacity  = Math.min(99, Math.round((liveVisitors / PARK_CAPACITY) * 100));

    // ── 2. Today's total (all visits that checked in today) ───
    const [[todayRow]] = await conn.execute(`
      SELECT COALESCE(SUM(vi.participant_count), 0) AS today_total
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      WHERE DATE(v.check_in_time) = CURDATE()
    `);
    const todayTotal = Number(todayRow.today_total);

    // Yesterday's total for trend
    const [[yestRow]] = await conn.execute(`
      SELECT COALESCE(SUM(vi.participant_count), 0) AS yest_total
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      WHERE DATE(v.check_in_time) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
    `);
    const yesterdayTotal = Number(yestRow.yest_total) || todayTotal;
    const diff = todayTotal - yesterdayTotal;
    const trendSign = diff >= 0 ? "+" : "-";
    const trendPct  = yesterdayTotal > 0
      ? Math.abs((diff / yesterdayTotal) * 100).toFixed(1)
      : "0.0";

    // ── 3. Active alerts count ────────────────────────────────
    const [[alertRow]] = await conn.execute(`
      SELECT COUNT(*) AS alerts FROM alerts WHERE status = 'Active'
    `);
    const activeAlerts = Number(alertRow.alerts);

    // ── 4. Zone summary ───────────────────────────────────────
    const [zoneRows] = await conn.execute(`
      SELECT z.id, z.name, z.capacity,
             COALESCE(SUM(vi.participant_count), 0) AS count
      FROM zones z
      LEFT JOIN visits v  ON v.current_zone_id = z.id AND v.status = 'inside'
      LEFT JOIN visitors vi ON v.visitor_id = vi.id
      GROUP BY z.id, z.name, z.capacity
      ORDER BY z.id
    `);
    const zones = zoneRows.map(z => {
      const fill  = Math.min(99, Math.round((z.count / z.capacity) * 100));
      const level = fill >= 75 ? "High" : fill >= 45 ? "Moderate" : "Normal";
      return { id: z.id, name: z.name, count: Number(z.count), capacity: z.capacity, fill, level };
    });

    // ── 5. Recent alerts (last 3) ─────────────────────────────
    const [recentAlerts] = await conn.execute(`
      SELECT a.id, a.message, a.severity, a.status, a.created_at,
             z.name AS zone_name
      FROM alerts a
      LEFT JOIN zones z ON a.zone_id = z.id
      ORDER BY a.created_at DESC
      LIMIT 3
    `);

    // ── 6. This-month total for header ────────────────────────
    const [[monthRow]] = await conn.execute(`
      SELECT COALESCE(SUM(vi.participant_count), 0) AS month_total
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      WHERE YEAR(v.check_in_time) = YEAR(CURDATE())
        AND MONTH(v.check_in_time) = MONTH(CURDATE())
    `);
    const monthTotal = Number(monthRow.month_total);

    // ── 7. Avg daily this month ───────────────────────────────
    const [[avgRow]] = await conn.execute(`
      SELECT ROUND(AVG(daily_count)) AS avg_daily FROM (
        SELECT DATE(v.check_in_time) AS d, SUM(vi.participant_count) AS daily_count
        FROM visits v JOIN visitors vi ON v.visitor_id = vi.id
        WHERE YEAR(v.check_in_time) = YEAR(CURDATE())
          AND MONTH(v.check_in_time) = MONTH(CURDATE())
        GROUP BY d
      ) t
    `);
    const avgDaily = Number(avgRow.avg_daily) || 0;

    conn.release();

    res.json({
      kpi: {
        todayTotal,
        trendSign,
        trendPct,
        liveVisitors,
        liveCapacity,
        activeAlerts,
        monthTotal,
        avgDaily
      },
      zones,
      recentAlerts
    });

  } catch (err) {
    console.error("GET /overview:", err.message);
    res.status(500).json({ error: "Failed to fetch overview data" });
  }
});

module.exports = router;
