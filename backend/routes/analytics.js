// routes/analytics.js — GET /api/analytics
const express = require("express");
const router  = express.Router();
const pool    = require("../db/connection");

// ─── Helpers ──────────────────────────────────────────────────
function getPeriodClause(period) {
  switch (period) {
    case "Today":         return `DATE(v.check_in_time) = CURDATE()`;
    case "Yesterday":     return `DATE(v.check_in_time) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
    case "Last 7 days":   return `v.check_in_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    case "Last 30 days":  return `v.check_in_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
    case "Last month":    return `YEAR(v.check_in_time) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
                                  AND MONTH(v.check_in_time) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))`;
    case "This quarter":  return `v.check_in_time >= DATE_SUB(NOW(), INTERVAL 3 MONTH)`;
    default:              return `YEAR(v.check_in_time) = YEAR(NOW())
                                  AND MONTH(v.check_in_time) = MONTH(NOW())`; // "This month"
  }
}

// The "previous, same-length period" to compare against for trend % —
// used so e.g. "Last 7 days" compares against the 7 days before that,
// not always against last calendar month.
function getPrevPeriodClause(period) {
  switch (period) {
    case "Today":         return `DATE(v.check_in_time) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
    case "Yesterday":     return `DATE(v.check_in_time) = DATE_SUB(CURDATE(), INTERVAL 2 DAY)`;
    case "Last 7 days":   return `v.check_in_time >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND v.check_in_time < DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    case "Last 30 days":  return `v.check_in_time >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND v.check_in_time < DATE_SUB(NOW(), INTERVAL 30 DAY)`;
    case "Last month":    return `YEAR(v.check_in_time) = YEAR(DATE_SUB(NOW(), INTERVAL 2 MONTH))
                                  AND MONTH(v.check_in_time) = MONTH(DATE_SUB(NOW(), INTERVAL 2 MONTH))`;
    case "This quarter":  return `v.check_in_time >= DATE_SUB(NOW(), INTERVAL 6 MONTH) AND v.check_in_time < DATE_SUB(NOW(), INTERVAL 3 MONTH)`;
    default:              return `YEAR(v.check_in_time) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
                                  AND MONTH(v.check_in_time) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))`; // "This month" → vs last month
  }
}

function getTypeClause(type) {
  if (type === "Individual") return `AND vi.visitor_type = 'Individual'`;
  if (type === "Group")      return `AND vi.visitor_type = 'Group'`;
  return "";
}

function getPurposeClause(purpose) {
  if (purpose && purpose !== "All purposes") return `AND vi.purpose = '${purpose}'`;
  return "";
}

// ─── GET /api/analytics ───────────────────────────────────────
// All-in-one: trend, demographics, peak hours — drives AnalyticsPage
router.get("/", async (req, res) => {
  const { period = "This month", type = "All types", purpose = "All purposes", holidays } = req.query;

  const typeClause    = getTypeClause(type);
  const purposeClause = getPurposeClause(purpose);

  try {
    const conn = await pool.getConnection();

    // ── 1. Monthly trend (12 months rolling) ─────────────────
    const [trendRows] = await conn.execute(`
      SELECT
        YEAR(v.check_in_time)  AS yr,
        MONTH(v.check_in_time) AS mo,
        SUM(vi.participant_count) AS total
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      WHERE v.check_in_time >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        ${typeClause}
        ${purposeClause}
      GROUP BY yr, mo
      ORDER BY yr, mo
    `);

    // Map into a 12-slot array (Jan-Dec of current year or rolling)
    // Build month map
    const monthMap = {};
    trendRows.forEach(r => { monthMap[`${r.yr}-${r.mo}`] = Number(r.total); });

    // Generate last 12 months in order
    const now = new Date();
    const trendBars = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()+1}`;
      const raw = monthMap[key] || 0;
      // Normalize to bar height 10-98
      trendBars.unshift(raw); // we'll normalise after collecting all
    }
    // Re-sort for display (oldest → newest)
    const maxVal      = Math.max(...trendBars, 1);
    const normBars    = trendBars.map(v => Math.max(10, Math.round((v / maxVal) * 90)));

    // ── 2. Period totals for header stats ─────────────────────
    const [[periodRow]] = await conn.execute(`
      SELECT
        SUM(vi.participant_count)  AS total,
        COUNT(DISTINCT v.visitor_id) AS unique_visitors
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      WHERE ${getPeriodClause(period)}
        ${typeClause}
        ${purposeClause}
    `);

    // Previous period (same duration, shifted back) — uses the correct
    // comparison window for whichever period was requested.
    const [[prevRow]] = await conn.execute(`
      SELECT SUM(vi.participant_count) AS total
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      WHERE ${getPrevPeriodClause(period)}
        ${typeClause}
        ${purposeClause}
    `);

    const totalVisitors = Number(periodRow.total) || 0;
    const prevTotal     = Number(prevRow.total)   || totalVisitors;
    const diff          = totalVisitors - prevTotal;
    const trendSign     = diff >= 0 ? "+" : "-";
    const trendPct      = prevTotal > 0 ? Math.abs((diff / prevTotal) * 100).toFixed(1) : "0.0";

    // Weekend avg (visitors on Sat/Sun)
    const [[wkRow]] = await conn.execute(`
      SELECT ROUND(AVG(daily_count)) AS weekend_avg FROM (
        SELECT DATE(v.check_in_time) AS d, SUM(vi.participant_count) AS daily_count
        FROM visits v
        JOIN visitors vi ON v.visitor_id = vi.id
        WHERE DAYOFWEEK(v.check_in_time) IN (1,7)
          AND v.check_in_time >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
          ${typeClause}
          ${purposeClause}
        GROUP BY d
      ) t
    `);
    const weekendAvg = Number(wkRow.weekend_avg) || 0;

    // Avg daily
    const [[avgRow]] = await conn.execute(`
      SELECT ROUND(AVG(daily_count)) AS avg_daily FROM (
        SELECT DATE(v.check_in_time) AS d, SUM(vi.participant_count) AS daily_count
        FROM visits v
        JOIN visitors vi ON v.visitor_id = vi.id
        WHERE v.check_in_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          ${typeClause}
          ${purposeClause}
        GROUP BY d
      ) t
    `);
    const avgDaily = Number(avgRow.avg_daily) || 0;

    // Returning visitors estimate (visited more than once)
    const [[retRow]] = await conn.execute(`
      SELECT COUNT(*) AS ret FROM (
        SELECT visitor_id, COUNT(*) AS cnt
        FROM visits
        WHERE check_in_time >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        GROUP BY visitor_id
        HAVING cnt > 1
      ) t
    `);
    const returning = Number(retRow.ret) || 0;

    // ── 3. Demographics ───────────────────────────────────────
    // Individual vs Group split
    const [[splitRow]] = await conn.execute(`
      SELECT
        SUM(CASE WHEN vi.visitor_type='Individual' THEN vi.participant_count ELSE 0 END) AS ind,
        SUM(CASE WHEN vi.visitor_type='Group'      THEN vi.participant_count ELSE 0 END) AS grp
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      WHERE ${getPeriodClause(period)}
        ${purposeClause}
    `);
    const ind = Number(splitRow.ind) || 0;
    const grp = Number(splitRow.grp) || 0;
    const ttl = ind + grp || 1;
    const demSplit = [
      Math.round((ind / ttl) * 100),
      Math.round((grp / ttl) * 100)
    ];

    // Race breakdown as segments
    const [raceRows] = await conn.execute(`
      SELECT vi.race, SUM(vi.participant_count) AS cnt
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      WHERE ${getPeriodClause(period)}
        ${typeClause}
        ${purposeClause}
      GROUP BY vi.race
      ORDER BY cnt DESC
      LIMIT 4
    `);
    const segTotal = raceRows.reduce((s,r) => s + Number(r.cnt), 0) || 1;
    const segments = raceRows.map(r => [
      r.race,
      Math.round((Number(r.cnt) / segTotal) * 100),
      r.race === "Malay" ? "Largest group" : r.race === "Chinese" ? "Second largest" : r.race === "Indian" ? "Growing segment" : "Others"
    ]);

    // Purpose breakdown for category rail
    const [purposeRows] = await conn.execute(`
      SELECT vi.purpose, SUM(vi.participant_count) AS cnt
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      WHERE ${getPeriodClause(period)}
        ${typeClause}
      GROUP BY vi.purpose
      ORDER BY cnt DESC
      LIMIT 5
    `);
    const purpTotal = purposeRows.reduce((s,r) => s + Number(r.cnt), 0) || 1;
    const categoryRail = purposeRows.map(r => [
      r.purpose,
      Math.round((Number(r.cnt) / purpTotal) * 100)
    ]);

    // ── 4. Peak hours ─────────────────────────────────────────
    const [hourRows] = await conn.execute(`
      SELECT HOUR(v.check_in_time) AS hr, SUM(vi.participant_count) AS cnt
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      WHERE v.check_in_time >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        ${typeClause}
        ${purposeClause}
      GROUP BY hr
      ORDER BY cnt DESC
      LIMIT 1
    `);
    const peakHrNum  = hourRows[0]?.hr ?? 11;
    const peakHour   = `${String(peakHrNum).padStart(2,"0")}:00 - ${String(peakHrNum+1).padStart(2,"0")}:00`;

    // Peak day of week
    const [dayRows] = await conn.execute(`
      SELECT DAYNAME(v.check_in_time) AS dn, SUM(vi.participant_count) AS cnt
      FROM visits v
      JOIN visitors vi ON v.visitor_id = vi.id
      WHERE v.check_in_time >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        ${typeClause}
        ${purposeClause}
      GROUP BY dn
      ORDER BY cnt DESC
      LIMIT 1
    `);
    const peakDayName = dayRows[0]?.dn ?? "Saturday";
    const peakDay     = `${peakDayName} has the highest recurring volume.`;

    conn.release();

    res.json({
      trendBars:  normBars,
      totalVisitors,
      trendSign,
      trendPct,
      weekendAvg,
      avgDaily,
      returning,
      demSplit,
      segments,
      categoryRail,
      peakHour,
      peakDay
    });

  } catch (err) {
    console.error("GET /analytics:", err.message);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

module.exports = router;
