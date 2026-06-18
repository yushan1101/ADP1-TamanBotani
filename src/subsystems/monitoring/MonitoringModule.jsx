import React, { useState } from "react";
import { Activity, RefreshCw, Download } from "lucide-react";
import { useToast } from "../../components/ToastContext";
import { useMonitoring } from "../../context/MonitoringContext";
import { SummaryTile } from "../../components/SummaryTile";
import { downloadTextFile, rowsToCsv } from "./utils/download";
import { LiveDashboard } from "./live-dashboard/LiveDashboard";
import { MonitoringProviders } from "./MonitoringProviders";

function LiveMonitoringContent() {
  const [refreshing, setRefreshing] = useState(false);
  const { notify }                  = useToast();
  const { system, refreshAll }      = useMonitoring();
  const { liveStats }               = system;

  function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    notify("Pulling latest counts from entry, exit, and zone checkpoints…", { title: "Refreshing live feed", tone: "info", duration: 1400 });
    setTimeout(() => { refreshAll(); setRefreshing(false); }, 1200);
  }

  function handleExportSnapshot() {
    const timestamp = new Date().toLocaleString();
    const csv = rowsToCsv(
      ["Metric", "Value", "Note"],
      [
        ["Visitors inside",  liveStats.visitors.toString(), `${liveStats.capacity}% capacity`],
        ["Peak window",      "11:00",                       "Main Gate rising"],
        ["Open alerts",      liveStats.alerts.toString(),   "Crowd + long stay"],
        ["Reports ready",    "7",                           "3 scheduled today"],
        ["Snapshot taken",   timestamp,                     ""],
      ]
    );
    downloadTextFile(`operations-snapshot-${Date.now()}.csv`, csv, "text/csv");
    notify("Snapshot CSV downloaded to your device.", { title: "Export snapshot", tone: "good" });
  }

  return (
    <>
      <section className="monitorCommand">
        <div className="monitorCommandIntro">
          <span className="monitorLivePill"><Activity size={14} /> Live feed healthy</span>
          <h2>Today Operations</h2>
          <p>{new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })} status board with crowd load, open alerts, staff actions, visitor movement, and report readiness.</p>
          <div className="monitorCommandActions">
            <button className="primaryButton" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={17} className={refreshing ? "spinning" : ""} /> {refreshing ? "Refreshing…" : "Refresh live feed"}
            </button>
            <button className="ghostButton" onClick={handleExportSnapshot}><Download size={17} /> Export snapshot</button>
          </div>
        </div>
        <div className="monitorCommandStats">
          <SummaryTile label="Visitors inside"  value={liveStats.visitors.toString()} note={`${liveStats.capacity}% capacity`} tone="good" />
          <SummaryTile label="Peak window"      value="11:00"                         note="Main Gate rising" />
          <SummaryTile label="Open alerts"      value={liveStats.alerts.toString()}   note="1 crowd, 1 long stay" tone="danger" />
          <SummaryTile label="Reports ready"    value="7"                             note="3 scheduled today" />
        </div>
      </section>

      <LiveDashboard />
    </>
  );
}

export function MonitoringModule() {
  return (
    <MonitoringProviders>
      <LiveMonitoringContent />
    </MonitoringProviders>
  );
}
