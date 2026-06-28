// utils/exportExcel.js — Professional Excel export using SheetJS (xlsx)
import * as XLSX from "xlsx";

// ─── Style helpers (SheetJS cell format strings) ─────────────
function cell(v, t = "s", style = {}) {
  return { v, t, s: style };
}

// Build a worksheet from sections
// Each section: { title, headers, rows }
function buildWorksheet(sections) {
  const ws   = {};
  const cols = [];
  let   row  = 1; // 1-indexed

  sections.forEach(section => {
    // Section title row — merged, bold green
    const titleCell = `A${row}`;
    ws[titleCell] = {
      v: section.title,
      t: "s",
      s: {
        font:   { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
        fill:   { fgColor: { rgb: "2D4A1E" } },
        border: {},
      }
    };
    // Extend the merge across all header columns
    const span = section.headers.length;
    if (!ws["!merges"]) ws["!merges"] = [];
    ws["!merges"].push({
      s: { r: row - 1, c: 0 },
      e: { r: row - 1, c: span - 1 }
    });
    row++;

    // Header row
    section.headers.forEach((h, ci) => {
      const addr = XLSX.utils.encode_cell({ r: row - 1, c: ci });
      ws[addr] = {
        v: h, t: "s",
        s: {
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 10 },
          fill: { fgColor: { rgb: "6B8F47" } },
          alignment: { horizontal: "center" },
        }
      };
    });
    row++;

    // Data rows
    section.rows.forEach((dataRow, ri) => {
      const isAlt = ri % 2 === 1;
      dataRow.forEach((val, ci) => {
        const addr = XLSX.utils.encode_cell({ r: row - 1, c: ci });
        const isNum = typeof val === "number";
        ws[addr] = {
          v:    val ?? "",
          t:    isNum ? "n" : "s",
          s: {
            fill: { fgColor: { rgb: isAlt ? "EAF2E2" : "FFFFFF" } },
            font: { sz: 9, color: { rgb: "222222" } },
            alignment: ci === 0 ? { horizontal: "left" } : { horizontal: "center" },
          }
        };
      });
      row++;
    });

    // Blank gap row
    row += 1;
    cols.push(span);
  });

  // Auto column widths (estimate)
  ws["!cols"] = Array.from({ length: Math.max(...cols, 1) }, () => ({ wch: 22 }));

  // Set range
  const lastRow = row - 1;
  const lastCol = Math.max(...cols, 1) - 1;
  ws["!ref"] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: lastRow, c: lastCol });

  return ws;
}

// ─── Workbook wrapper ─────────────────────────────────────────
function downloadWorkbook(wb, filename) {
  XLSX.writeFile(wb, filename);
}

// ─── Export functions ─────────────────────────────────────────

export function exportOperationalExcel({ reportType, dateRange, liveStats, analytics }) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: KPI Summary
  const summaryWs = buildWorksheet([
    {
      title:   "KEY PERFORMANCE INDICATORS",
      headers: ["Metric", "Value", "Notes"],
      rows: [
        ["Total Visitors",      analytics?.totalVisitors ?? 0,  dateRange],
        ["Visitors Inside Now", liveStats?.visitors ?? 0,       `${liveStats?.capacity ?? 0}% capacity`],
        ["Daily Average",       analytics?.avgDaily ?? 0,        "Last 30 days"],
        ["Weekend Average",     analytics?.weekendAvg ?? 0,      "Sat & Sun"],
        ["Returning Visitors",  analytics?.returning ?? 0,       "Visited 2+ times"],
        ["Trend vs Previous",   `${analytics?.trendSign ?? "+"}${analytics?.trendPct ?? "0"}%`, "Same prior period"],
      ]
    },
    {
      title:   "PEAK INSIGHTS",
      headers: ["Metric", "Value"],
      rows: [
        ["Peak Hour",  analytics?.peakHour ?? "—"],
        ["Peak Day",   analytics?.peakDay  ?? "—"],
      ]
    }
  ]);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // Sheet 2: Demographics
  const demRows = [
    ...(analytics?.segments ?? []).map(s => [s[0], `${s[1]}%`, s[2] ?? ""]),
  ];
  const demWs = buildWorksheet([
    {
      title:   "VISITOR TYPE SPLIT",
      headers: ["Type", "Share"],
      rows: [
        ["Individual", `${analytics?.demSplit?.[0] ?? 0}%`],
        ["Group",      `${analytics?.demSplit?.[1] ?? 0}%`],
      ]
    },
    {
      title:   "DEMOGRAPHICS BY SEGMENT",
      headers: ["Segment", "Share", "Notes"],
      rows:    demRows.length ? demRows : [["No data", "", ""]]
    },
    {
      title:   "VISIT PURPOSE BREAKDOWN",
      headers: ["Purpose", "Share"],
      rows: (analytics?.categoryRail ?? []).map(r => [r[0], `${r[1]}%`])
    }
  ]);
  XLSX.utils.book_append_sheet(wb, demWs, "Demographics");

  // Sheet 3: Metadata
  const metaWs = XLSX.utils.aoa_to_sheet([
    ["Report Type",   reportType],
    ["Date Range",    dateRange],
    ["Generated At",  new Date().toLocaleString("en-MY")],
    ["System",        "Taman Botani Johor — Visitor Management System"],
  ]);
  XLSX.utils.book_append_sheet(wb, metaWs, "Info");

  downloadWorkbook(wb, `${reportType.replace(/\s+/g,"_")}_${dateRange.replace(/\s+/g,"_")}_${Date.now()}.xlsx`);
}

export function exportZoneExcel({ dateRange, zones }) {
  const wb = XLSX.utils.book_new();

  const ws = buildWorksheet([
    {
      title:   "ZONE OCCUPANCY REPORT",
      headers: ["Zone", "Visitors", "Capacity %", "Status"],
      rows: (zones || []).map(z => [
        z.name,
        z.count ?? 0,
        z.fill  ?? 0,
        z.level ?? "—"
      ])
    }
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "Zone Occupancy");

  const metaWs = XLSX.utils.aoa_to_sheet([
    ["Date Range",   dateRange],
    ["Generated At", new Date().toLocaleString("en-MY")],
    ["System",       "Taman Botani Johor — Visitor Management System"],
  ]);
  XLSX.utils.book_append_sheet(wb, metaWs, "Info");

  downloadWorkbook(wb, `Zone_Occupancy_${dateRange.replace(/\s+/g,"_")}_${Date.now()}.xlsx`);
}

export function exportVisitorSummaryExcel({ dateRange, liveStats, analytics }) {
  const wb = XLSX.utils.book_new();

  const ws = buildWorksheet([
    {
      title:   "DAILY VISITOR SUMMARY",
      headers: ["Metric", "Value", "Notes"],
      rows: [
        ["Period",              dateRange,                              ""],
        ["Total Visitors",      analytics?.totalVisitors ?? 0,         dateRange],
        ["Currently Inside",    liveStats?.visitors ?? 0,              `${liveStats?.capacity ?? 0}% capacity`],
        ["Daily Average",       analytics?.avgDaily ?? 0,              "Last 30 days"],
        ["Weekend Average",     analytics?.weekendAvg ?? 0,            "Sat & Sun"],
        ["Peak Hour",           analytics?.peakHour ?? "—",            "Highest traffic window"],
        ["Peak Day",            analytics?.peakDay  ?? "—",            ""],
        ["Trend vs Previous",   `${analytics?.trendSign ?? "+"}${analytics?.trendPct ?? "0"}%`, ""],
        ["Returning Visitors",  analytics?.returning ?? 0,             "Visited 2+ times"],
      ]
    }
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "Visitor Summary");

  downloadWorkbook(wb, `Daily_Visitor_Summary_${dateRange.replace(/\s+/g,"_")}_${Date.now()}.xlsx`);
}