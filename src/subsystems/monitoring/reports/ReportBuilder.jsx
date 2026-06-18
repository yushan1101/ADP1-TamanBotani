import React, { useState } from "react";
import { Download } from "lucide-react";
import { SummaryTile } from "../../../components/SummaryTile";
import { ChevronRight } from "lucide-react";
import { useToast } from "../../../components/ToastContext";
import { downloadTextFile, rowsToCsv } from "../utils/download";

const reportTypes = ["Operational Analytics", "Daily Visitor Summary", "Historical Visitor Pattern", "Zone Occupancy Report"];
const dateRanges = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "Custom range"];

export function ReportBuilder() {
  const [reportOpen, setReportOpen] = useState("preview");
  const [reportType, setReportType] = useState("Operational Analytics");
  const [dateRange, setDateRange] = useState("Today");
  const [exportFormat, setExportFormat] = useState("PDF");
  const { notify } = useToast();

  function buildReportContent() {
    return rowsToCsv(
      ["Field", "Value"],
      [
        ["Report type", reportType],
        ["Date range", dateRange],
        ["Total visitors", "1,284"],
        ["Peak hour", "11 AM (486 visitors)"],
        ["Top zone", "Main Gate (82% occupancy)"],
        ["Generated", new Date().toLocaleString()]
      ]
    );
  }

  function handleExport(format) {
    const content = buildReportContent();
    const ext = format === "Excel" ? "csv" : "txt";
    downloadTextFile(`${reportType.replace(/\s+/g, "_").toLowerCase()}-${dateRange.replace(/\s+/g, "_").toLowerCase()}.${ext}`, content, format === "Excel" ? "text/csv" : "text/plain");
    notify(`${reportType} for "${dateRange}" exported as ${format}.`, { title: `${format} export ready`, tone: "good" });
  }

  return (
    <section className="panel spanTwo">
      <div className="panelHeader">
        <div><h2>Generate Operational Report</h2><p>Select report type, preview analytics, export, or schedule automatic generation.</p></div>
        <div className="buttonRow">
          <button className="ghostButton" onClick={() => handleExport("Excel")}><Download size={17} /> Excel</button>
          <button className="primaryButton" onClick={() => handleExport("PDF")}><Download size={17} /> PDF</button>
        </div>
      </div>
      <div className="reportBuilder">
        <label>
          Report type
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            {reportTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label>
          Date range
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            {dateRanges.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label>
          Export format
          <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
            <option>PDF</option>
            <option>Excel</option>
          </select>
        </label>
      </div>
      <div className="reportPreview">
        <button className="expandHeader" onClick={() => setReportOpen(reportOpen === "preview" ? "" : "preview")}>
          <strong>{reportType} Preview</strong>
          <ChevronRight size={17} className={reportOpen === "preview" ? "open" : ""} />
        </button>
        {reportOpen === "preview" && (
          <>
            <div className="analyticsCards">
              <SummaryTile label="Total visitors" value="1,284" note={dateRange} />
              <SummaryTile label="Peak hour" value="11 AM" note="486 visitors" />
              <SummaryTile label="Top zone" value="Main Gate" note="82% occupancy" />
            </div>
            <div className="reportPreviewDetails">
              <span>Included sections</span>
              <strong>Live count, demographic summary, zone occupancy, alert log, report history</strong>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
