// src/subsystems/monitoring/reports/HistoryTable.jsx
// Updated: fetches report history from backend API
import React, { useEffect, useState } from "react";
import { Download, Loader2, Trash2 } from "lucide-react";
import { useToast } from "../../../components/ToastContext";
import { downloadTextFile } from "../utils/download";
import { fetchReports, deleteReport } from "../../../api/monitoringApi";

export function HistoryTable() {
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(null);
  const { notify } = useToast();

  function loadReports() {
    setLoading(true);
    fetchReports()
      .then(data => setReports(data.reports || []))
      .catch(err  => console.error("fetchReports:", err))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadReports(); }, []);

  function handleDownload(report, e) {
    e.stopPropagation();
    const fileName = `${report.title.replace(/[^a-zA-Z0-9]/g, "_")}.${report.format === "Excel" ? "csv" : "txt"}`;
    const content = [
      report.title,
      `Period: ${report.period_label}`,
      `Format: ${report.format}`,
      `Type:   ${report.report_type}`,
      `Size:   ${report.file_size}`,
      `Status: ${report.status}`,
      `Generated: ${new Date(report.generated_at).toLocaleString()}`
    ].join("\n");
    downloadTextFile(fileName, content);
    notify(`${report.title} downloaded.`, { title: "Download started", tone: "good" });
  }

  async function handleDelete(report, e) {
    e.stopPropagation();
    try {
      await deleteReport(report.id);
      setReports(prev => prev.filter(r => r.id !== report.id));
      notify(`${report.title} removed.`, { title: "Report deleted", tone: "info" });
    } catch {
      notify("Could not delete report.", { title: "Error", tone: "bad" });
    }
  }

  function fmtDate(dt) {
    return new Date(dt).toLocaleString("en-MY", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false
    });
  }

  if (loading) {
    return (
      <section className="panel spanThree">
        <div className="panelHeader">
          <div><h2>Generated Report History</h2><p>Past generated files can be downloaded again or removed.</p></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "20px 0", color: "var(--text-muted)" }}>
          <Loader2 size={18} className="spin" /> Loading report history…
        </div>
      </section>
    );
  }

  return (
    <section className="panel spanThree">
      <div className="panelHeader">
        <div><h2>Generated Report History</h2><p>Past generated files can be downloaded again or removed.</p></div>
      </div>
      <table className="dataTable">
        <thead>
          <tr>
            <th>Report</th>
            <th>Period</th>
            <th>Generated</th>
            <th>Format</th>
            <th>Size</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <React.Fragment key={r.id}>
              <tr
                className={expanded === r.id ? "selectedRow" : ""}
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                <td>{r.title}</td>
                <td>{r.period_label}</td>
                <td>{fmtDate(r.generated_at)}</td>
                <td>{r.format}</td>
                <td>{r.file_size}</td>
                <td className="statusCell">{r.status}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="ghostButton" onClick={(e) => handleDownload(r, e)}>
                      <Download size={14} /> Download
                    </button>
                    <button className="ghostButton" onClick={(e) => handleDelete(r, e)} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
              {expanded === r.id && (
                <tr className="expandedRecordRow">
                  <td colSpan="7">
                    <div className="reportHistoryDetails">
                      <div><span>Report ID</span><strong>{r.id}</strong></div>
                      <div><span>Type</span><strong>{r.report_type}</strong></div>
                      <div><span>File size</span><strong>{r.file_size}</strong></div>
                      <div><span>Available actions</span><strong>Download again or delete archived copy</strong></div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {reports.length === 0 && (
            <tr><td colSpan="7" style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)" }}>No reports yet.</td></tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
