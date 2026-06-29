// src/subsystems/monitoring/reports/ReportBuilder.jsx
import React, { useState, useEffect } from "react";
import { Download, Loader2, FileText, TableProperties, ChevronRight } from "lucide-react";
import { SummaryTile } from "../../../components/SummaryTile";
import { useToast } from "../../../components/ToastContext";
import { generateReport, fetchAnalytics } from "../../../api/monitoringApi";
import { useMonitoring } from "../../../context/MonitoringContext";
import { exportOperationalPdf, exportZonePdf, exportVisitorSummaryPdf } from "../utils/exportPdf";
import { exportOperationalExcel, exportZoneExcel, exportVisitorSummaryExcel } from "../utils/exportExcel";

const reportTypes = [
  "Operational Analytics",
  "Daily Visitor Summary",
  "Zone Occupancy Report",
];
const dateRanges = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "This month"];

export function ReportBuilder() {
  const [reportOpen,   setReportOpen]   = useState("preview");
  const [reportType,   setReportType]   = useState("Operational Analytics");
  const [dateRange,    setDateRange]    = useState("Today");
  const [generating,   setGenerating]   = useState(null); // "PDF" | "Excel" | null
  const { notify }  = useToast();
  const { system }  = useMonitoring();

  const [reportAnalytics, setReportAnalytics]         = useState(null);
  const [reportAnalyticsLoading, setReportAnalyticsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setReportAnalyticsLoading(true);
    fetchAnalytics({ period: dateRange })
      .then(data  => { if (!cancelled) setReportAnalytics(data); })
      .catch(()   => { if (!cancelled) setReportAnalytics(null); })
      .finally(() => { if (!cancelled) setReportAnalyticsLoading(false); });
    return () => { cancelled = true; };
  }, [dateRange]);

  async function handleExport(format) {
    setGenerating(format);
    try {
      // Save to DB
      await generateReport({
        title:        `${reportType} — ${dateRange} (${new Date().toLocaleDateString("en-MY")})`,
        report_type:  dateRange === "Today" || dateRange === "Yesterday" ? "Daily"
                    : dateRange === "Last 7 days" ? "Weekly" : "Monthly",
        format,
        period_label: dateRange
      });

      // Build export payload
      const payload = {
        reportType,
        dateRange,
        liveStats: system.liveStats,
        analytics: reportAnalytics,
        zones:     system.zones,
      };

      // Trigger real file download
      if (format === "PDF") {
        if (reportType === "Zone Occupancy Report") exportZonePdf(payload);
        else if (reportType === "Daily Visitor Summary") exportVisitorSummaryPdf(payload);
        else exportOperationalPdf(payload);
      } else {
        if (reportType === "Zone Occupancy Report") exportZoneExcel(payload);
        else if (reportType === "Daily Visitor Summary") exportVisitorSummaryExcel(payload);
        else exportOperationalExcel(payload);
      }

      notify(`${reportType} exported as ${format}.`, { title: `${format} ready`, tone: "good" });
    } catch (err) {
      console.error(err);
      notify("Export failed. Please try again.", { title: "Error", tone: "bad" });
    } finally {
      setGenerating(null);
    }
  }

  const { liveStats } = system;
  const analytics     = reportAnalytics;
  const loading       = reportAnalyticsLoading;

  return (
    <section className="panel spanTwo">
      <div className="panelHeader">
        <div>
          <h2>Generate Report</h2>
          <p>Select type and date range, preview data, then export as PDF or Excel.</p>
        </div>
        <div className="buttonRow">
          <button
            className="ghostButton"
            onClick={() => handleExport("Excel")}
            disabled={!!generating || loading}
          >
            {generating === "Excel"
              ? <><Loader2 size={16} className="spin" /> Exporting…</>
              : <><TableProperties size={16} /> Excel</>}
          </button>
          <button
            className="primaryButton"
            onClick={() => handleExport("PDF")}
            disabled={!!generating || loading}
          >
            {generating === "PDF"
              ? <><Loader2 size={16} className="spin" /> Exporting…</>
              : <><FileText size={16} /> PDF</>}
          </button>
        </div>
      </div>

      <div className="reportBuilder">
        <label>
          Report type
          <select value={reportType} onChange={e => setReportType(e.target.value)}>
            {reportTypes.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label>
          Date range
          <select value={dateRange} onChange={e => setDateRange(e.target.value)}>
            {dateRanges.map(d => <option key={d}>{d}</option>)}
          </select>
        </label>
      </div>

      {/* Preview */}
      <div className="reportPreview">
        <button
          className="expandHeader"
          onClick={() => setReportOpen(reportOpen === "preview" ? "" : "preview")}
        >
          <strong>{reportType} Preview — {dateRange}</strong>
          <ChevronRight size={17} className={reportOpen === "preview" ? "open" : ""} />
        </button>

        {reportOpen === "preview" && (
          <>
            <div className="analyticsCards">
              <SummaryTile
                label="Total visitors"
                value={loading ? "…" : (analytics?.totalVisitors ?? 0).toLocaleString()}
                note={dateRange}
              />
              <SummaryTile
                label="Peak hour"
                value={loading ? "…" : (analytics?.peakHour ?? "—")}
                note="Highest footfall window"
              />
              <SummaryTile
                label="Visitors inside"
                value={liveStats?.visitors ?? "—"}
                note={`${liveStats?.capacity ?? 0}% capacity`}
              />
              <SummaryTile
                label="Daily average"
                value={loading ? "…" : (analytics?.avgDaily ?? "—")}
                note="Last 30 days"
              />
            </div>
            <div className="reportPreviewDetails">
              <span>What's included in the export</span>
              <strong>
                {reportType === "Zone Occupancy Report"
                  ? "Zone names, visitor counts, capacity %, status level"
                  : reportType === "Daily Visitor Summary"
                  ? "Visitor totals, peak hour, trend vs previous period, daily avg"
                  : "KPIs, peak insights, demographics, visitor type split, purpose breakdown"}
              </strong>
            </div>
          </>
        )}
      </div>
    </section>
  );
}