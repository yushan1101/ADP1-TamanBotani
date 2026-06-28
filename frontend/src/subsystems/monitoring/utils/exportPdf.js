// utils/exportPdf.js — Professional branded PDF export using jsPDF + autotable
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Brand colours
const GREEN_DARK  = [45, 74, 30];    // #2d4a1e
const GREEN_MID   = [107, 143, 71];  // #6b8f47
const GREEN_LIGHT = [234, 242, 226]; // #eaf2e2
const WHITE       = [255, 255, 255];
const GREY_TEXT   = [90, 90, 90];
const GREY_LIGHT  = [245, 247, 242];

function addHeader(doc, title, dateRange) {
  const W = doc.internal.pageSize.getWidth();

  // Dark green header bar
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, W, 32, "F");

  // Logo circle
  doc.setFillColor(...GREEN_MID);
  doc.circle(18, 16, 8, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TBJ", 18, 19.5, { align: "center" });

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text(title, 32, 13);

  // Subtitle line
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 210, 160);
  doc.text(`Taman Botani Johor  ·  ${dateRange}  ·  Generated ${new Date().toLocaleString("en-MY")}`, 32, 23);

  // Thin green accent line below header
  doc.setFillColor(...GREEN_MID);
  doc.rect(0, 32, W, 1.2, "F");
}

function addFooter(doc) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const pages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(...GREY_LIGHT);
    doc.rect(0, H - 12, W, 12, "F");
    doc.setFontSize(8);
    doc.setTextColor(...GREY_TEXT);
    doc.setFont("helvetica", "normal");
    doc.text("Taman Botani Johor — Visitor Management System", 14, H - 4.5);
    doc.text(`Page ${i} of ${pages}`, W - 14, H - 4.5, { align: "right" });
  }
}

function sectionTitle(doc, text, y) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...GREEN_LIGHT);
  doc.rect(14, y - 4, W - 28, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GREEN_DARK);
  doc.text(text, 17, y + 0.5);
  return y + 8;
}

function kpiGrid(doc, items, startY) {
  // items: [{label, value, note}]  — 2-per-row
  const W     = doc.internal.pageSize.getWidth();
  const boxW  = (W - 28 - 6) / 2;
  const boxH  = 20;
  let x = 14, y = startY;

  items.forEach((item, i) => {
    // Box
    doc.setFillColor(...GREY_LIGHT);
    doc.roundedRect(x, y, boxW, boxH, 2, 2, "F");
    doc.setDrawColor(...GREEN_MID);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y, boxW, boxH, 2, 2, "S");

    // Label
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY_TEXT);
    doc.text(item.label.toUpperCase(), x + 5, y + 7);

    // Value
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GREEN_DARK);
    doc.text(String(item.value ?? "—"), x + 5, y + 16);

    // Note
    if (item.note) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GREEN_MID);
      doc.text(String(item.note), x + boxW - 5, y + 16, { align: "right" });
    }

    x += boxW + 6;
    if ((i + 1) % 2 === 0) { x = 14; y += boxH + 5; }
  });

  // If odd number of items, advance y
  if (items.length % 2 !== 0) y += boxH + 5;
  return y;
}

// ─── Main export functions ────────────────────────────────────

export function exportOperationalPdf({ reportType, dateRange, liveStats, analytics }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W   = doc.internal.pageSize.getWidth();

  addHeader(doc, reportType, dateRange);

  let y = 42;

  // ── KPI Summary ──
  y = sectionTitle(doc, "Key Performance Indicators", y);
  y += 2;
  y = kpiGrid(doc, [
    { label: "Total Visitors",   value: (analytics?.totalVisitors ?? 0).toLocaleString(), note: dateRange },
    { label: "Live Occupancy",   value: `${liveStats?.capacity ?? 0}%`,   note: `${liveStats?.visitors ?? 0} inside now` },
    { label: "Daily Average",    value: (analytics?.avgDaily ?? 0).toLocaleString(),       note: "Last 30 days" },
    { label: "Weekend Average",  value: (analytics?.weekendAvg ?? 0).toLocaleString(),     note: "Sat & Sun" },
    { label: "Returning Visitors", value: analytics?.returning ?? 0,                       note: "Visited 2+ times" },
    { label: "Trend vs Previous", value: `${analytics?.trendSign ?? "+"}${analytics?.trendPct ?? "0"}%`, note: "vs same prior period" },
  ], y);
  y += 4;

  // ── Peak Insights ──
  y = sectionTitle(doc, "Peak Insights", y);
  y += 4;
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [["Metric", "Value"]],
    body: [
      ["Peak Hour",    analytics?.peakHour ?? "—"],
      ["Peak Day",     analytics?.peakDay  ?? "—"],
    ],
    theme: "grid",
    headStyles:  { fillColor: GREEN_DARK,  textColor: WHITE, fontStyle: "bold", fontSize: 9 },
    bodyStyles:  { fontSize: 9, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: GREY_LIGHT },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 } },
  });
  y = doc.lastAutoTable.finalY + 6;

  // ── Demographics ──
  if (analytics?.segments?.length) {
    y = sectionTitle(doc, "Visitor Demographics", y);
    y += 4;
    const segRows = analytics.segments.map(s => [s[0], `${s[1]}%`, s[2] ?? ""]);
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [["Segment", "Share", "Notes"]],
      body: segRows,
      theme: "grid",
      headStyles:  { fillColor: GREEN_DARK,  textColor: WHITE, fontStyle: "bold", fontSize: 9 },
      bodyStyles:  { fontSize: 9, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: GREY_LIGHT },
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  // ── Visitor Type split ──
  if (analytics?.demSplit) {
    y = sectionTitle(doc, "Visitor Type Breakdown", y);
    y += 4;
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [["Type", "Share"]],
      body: [
        ["Individual", `${analytics.demSplit[0]}%`],
        ["Group",      `${analytics.demSplit[1]}%`],
      ],
      theme: "grid",
      headStyles:  { fillColor: GREEN_MID, textColor: WHITE, fontStyle: "bold", fontSize: 9 },
      bodyStyles:  { fontSize: 9, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: GREY_LIGHT },
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  // ── Purpose Breakdown ──
  if (analytics?.categoryRail?.length) {
    y = sectionTitle(doc, "Visit Purpose Breakdown", y);
    y += 4;
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [["Purpose", "Share"]],
      body: analytics.categoryRail.map(r => [r[0], `${r[1]}%`]),
      theme: "grid",
      headStyles:  { fillColor: GREEN_MID, textColor: WHITE, fontStyle: "bold", fontSize: 9 },
      bodyStyles:  { fontSize: 9, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: GREY_LIGHT },
    });
  }

  addFooter(doc);
  doc.save(`${reportType.replace(/\s+/g, "_")}_${dateRange.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
}

export function exportZonePdf({ reportType, dateRange, zones }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  addHeader(doc, reportType, dateRange);

  let y = 42;
  y = sectionTitle(doc, "Zone Occupancy Status", y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [["Zone", "Visitors", "Capacity %", "Status"]],
    body: (zones || []).map(z => [
      z.name,
      z.count ?? "—",
      `${z.fill ?? 0}%`,
      z.level ?? "—"
    ]),
    theme: "grid",
    headStyles:  { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 10 },
    bodyStyles:  { fontSize: 10, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: GREY_LIGHT },
    columnStyles: {
      3: {
        fontStyle: "bold",
        // coloured by level — applied via didParseCell below
      }
    },
    didParseCell(data) {
      if (data.column.index === 3 && data.section === "body") {
        const val = data.cell.raw;
        if (val === "High")     data.cell.styles.textColor = [163, 45, 45];
        if (val === "Moderate") data.cell.styles.textColor = [140, 100, 0];
        if (val === "Normal")   data.cell.styles.textColor = [45, 100, 30];
      }
    }
  });

  addFooter(doc);
  doc.save(`Zone_Occupancy_${dateRange.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
}

export function exportVisitorSummaryPdf({ reportType, dateRange, liveStats, analytics }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  addHeader(doc, reportType, dateRange);

  let y = 42;
  y = sectionTitle(doc, "Daily Visitor Summary", y);
  y += 2;
  y = kpiGrid(doc, [
    { label: "Total Visitors",  value: (analytics?.totalVisitors ?? 0).toLocaleString(), note: dateRange },
    { label: "Currently Inside", value: liveStats?.visitors ?? "—", note: `${liveStats?.capacity ?? 0}% capacity` },
    { label: "Daily Average",   value: analytics?.avgDaily ?? "—", note: "Last 30 days" },
    { label: "Peak Hour",       value: analytics?.peakHour ?? "—", note: "Highest traffic" },
  ], y);
  y += 4;

  y = sectionTitle(doc, "Trend vs Previous Period", y);
  y += 4;
  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [["Metric", "Value"]],
    body: [
      ["Period",           dateRange],
      ["Total visitors",   (analytics?.totalVisitors ?? 0).toLocaleString()],
      ["vs previous period", `${analytics?.trendSign ?? "+"}${analytics?.trendPct ?? "0"}%`],
      ["Weekend average",  analytics?.weekendAvg ?? "—"],
      ["Peak day",         analytics?.peakDay ?? "—"],
    ],
    theme: "grid",
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: GREY_LIGHT },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 } },
  });

  addFooter(doc);
  doc.save(`Daily_Visitor_Summary_${dateRange.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
}