import React, { useState } from "react";
import { Activity, AlertTriangle, Bell, Download, MapPin, RefreshCw, Users } from "lucide-react";
import { useMonitoring } from "../../../context/MonitoringContext";
import { useToast } from "../../../components/ToastContext";
import { downloadTextFile, rowsToCsv } from "../utils/download";

const levelRank = { High: 3, Moderate: 2, Normal: 1 };

export function LiveStats() {
  const { system, refreshAll } = useMonitoring();
  const { liveStats, zones } = system;
  const [refreshing, setRefreshing] = useState(false);
  const { notify } = useToast();

  function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    notify("Pulling latest counts from entry, exit, and zone checkpoints…", { title: "Refreshing live feed", tone: "info", duration: 1400 });
    setTimeout(() => {
      refreshAll();
      setRefreshing(false);
    }, 900);
  }

  function handleExportSnapshot() {
    const timestamp = new Date().toLocaleString();
    const csv = rowsToCsv(
      ["Metric", "Value", "Note"],
      [
        ["Visitors inside", liveStats.visitors.toString(), `${liveStats.capacity}% capacity`],
        ["Peak zone", highestPressureZone?.name || "Main Gate", `${highestPressureZone?.fill || 0}% load`],
        ["Open alerts", liveStats.alerts.toString(), "Crowd + long stay"],
        ["Watch zones", criticalZones.length.toString(), "Moderate or high"],
        ["Snapshot taken", timestamp, ""],
      ]
    );
    downloadTextFile(`operations-snapshot-${Date.now()}.csv`, csv, "text/csv");
    notify("Snapshot CSV downloaded to your device.", { title: "Export snapshot", tone: "good" });
  }

  const zoneStatusSorted = [...zones].sort((a, b) => {
    const byLevel = (levelRank[b.level] || 0) - (levelRank[a.level] || 0);
    return byLevel || b.fill - a.fill;
  });
  const highestPressureZone = zoneStatusSorted[0];
  const criticalZones = zoneStatusSorted.filter(zone => zone.level !== "Normal");
  const commandTone = liveStats.alerts >= 2 || highestPressureZone?.level === "High" ? "danger" : "warn";
  const nextAction = `Send 1 officer to ${highestPressureZone?.name || "Main Gate"}`;
  const secondaryAction = "Keep Herbarium route open";

  function handleJumpToAlerts() {
    document.getElementById("operational-alerts")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="panel operationsCommandPanel spanThree">
      <div className="panelHeader operationsHeader">
        <div>
          <span className="monitorLivePill"><Activity size={14} /> Monitoring status: connected</span>
          <h2>Today Operations</h2>
          <p>{new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })} live status, next action, and zone pressure.</p>
        </div>
        <div className="operationsHeaderActions">
          <button className="primaryButton" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? "spinning" : ""} /> {refreshing ? "Refreshing..." : "Refresh live feed"}
          </button>
          <button className="ghostButton" onClick={handleExportSnapshot}><Download size={16} /> Export snapshot</button>
        </div>
      </div>

      <div className="controlSummaryGrid">
        <div className="controlMetric primary">
          <div className="metricTopLine">
            <span className="metricIcon good"><Users size={17} /></span>
            <span>Visitors inside</span>
          </div>
          <div className="controlMetricMain">
            <strong>{liveStats.visitors ?? "—"}</strong>
            <i className="metricChip good">{liveStats.capacity != null ? `${liveStats.capacity}% capacity` : "Loading…"}</i>
          </div>
        </div>
        <button className={liveStats.alerts ? "controlMetric alert alertControlCard" : "controlMetric alertControlCard"} onClick={handleJumpToAlerts}>
          <div className="metricTopLine">
            <span className="metricIcon danger"><Bell size={17} /></span>
            <span>Active Alerts</span>
          </div>
          <div className="controlMetricMain">
            <strong>{liveStats.alerts ?? "—"}</strong>
            <i className={liveStats.alerts ? "metricChip danger" : "metricChip good"}>{liveStats.alerts == null ? "Loading…" : liveStats.alerts ? "Open queue" : "No action"}</i>
          </div>
        </button>
        <div className="controlMetric">
          <div className="metricTopLine">
            <span className={`metricIcon ${highestPressureZone?.level === "High" ? "danger" : highestPressureZone?.level === "Moderate" ? "warn" : "good"}`}><MapPin size={17} /></span>
            <span>Peak zone</span>
          </div>
          <div className="controlMetricMain">
            <strong>{highestPressureZone?.name || "Main Gate"}</strong>
            <i className={`metricChip ${highestPressureZone?.level === "High" ? "danger" : highestPressureZone?.level === "Moderate" ? "warn" : "good"}`}>{highestPressureZone?.fill || 0}% load</i>
          </div>
        </div>
        <div className="controlMetric">
          <div className="metricTopLine">
            <span className={criticalZones.length ? "metricIcon warn" : "metricIcon good"}><AlertTriangle size={17} /></span>
            <span>Watch zones</span>
          </div>
          <div className="controlMetricMain">
            <strong>{criticalZones.length}</strong>
            <i className={criticalZones.length ? "metricChip warn" : "metricChip good"}>Moderate or high</i>
          </div>
        </div>
      </div>

      <div className="controlWorkGrid">
        <div className="controlActionPanel">
          <div className="controlSectionLabel">Next action</div>
          <div className="controlActionLine">
            <AlertTriangle size={18} />
            <div>
              <strong>{nextAction}</strong>
              <span>{secondaryAction}</span>
            </div>
          </div>
          <div className="controlReason">
            {highestPressureZone?.name || "Main Gate"} is currently the highest pressure area.
          </div>
        </div>

        <div className="controlZoneTable">
          <div className="controlSectionLabel">Zone pressure</div>
          <div className="zoneTableRows">
            {zoneStatusSorted.map(zone => (
              <div className={`zoneTableRow ${zone.level.toLowerCase()}`} key={zone.name}>
                <strong>{zone.name}</strong>
                <span>{zone.count} visitors</span>
                <div className="zoneTableMeter"><i style={{ width: `${zone.fill}%` }} /></div>
                <small>{zone.level}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}