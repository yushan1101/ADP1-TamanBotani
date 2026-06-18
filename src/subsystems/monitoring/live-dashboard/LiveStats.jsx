import React, { useState } from "react";
import { CheckCircle2, Activity, AlertTriangle, RefreshCw } from "lucide-react";
import { StatusItem } from "../../../components/StatusItem";
import { ZoneMini } from "../../../components/ZoneMini";
import { useMonitoring } from "../../../context/MonitoringContext";
import { useToast } from "../../../components/ToastContext";

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

  const alertTone = liveStats.alerts >= 2 ? "danger" : "warn";

  return (
    <>
      <section className="panel monitorHero spanTwo">
        <div className="panelHeader">
          <div>
            <h2>Park Live Status</h2>
            <p>Realtime system connected to monitoring engine. Auto-refreshes every 5 seconds.</p>
          </div>
          <button className="primaryButton" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={17} className={refreshing ? "spinning" : ""} /> {refreshing ? "Refreshing…" : "Refresh Dashboard"}
          </button>
        </div>
        <div className="liveStatusGrid">
          <div className="liveDial">
            <strong>{liveStats.visitors}</strong>
            <span>visitors inside</span>
            <i>{liveStats.capacity}% capacity</i>
          </div>
          <div className="statusStack">
            <StatusItem icon={CheckCircle2} title="Occupancy status: Moderate"  text="Park capacity threshold remains below alert level."                       tone="good" />
            <StatusItem icon={Activity}     title="Live feed connected"          text="Entry, exit and checkpoint movement records are streaming normally."       tone="good" />
            <StatusItem icon={AlertTriangle} title={`${liveStats.alerts} high-density highlight${liveStats.alerts !== 1 ? "s" : ""}`} text="Main Gate and Herbarium require staff attention." tone={alertTone} />
            <div className="staffActionCard">
              <strong>Recommended staff action</strong>
              <span>Send one staff member to Main Gate queue lane and keep Herbarium route open.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div><h2>Current Occupancy</h2><p>Capacity status by area.</p></div>
        </div>
        <div className="compactZoneList">
          {zones.map(zone => <ZoneMini key={zone.name} zone={zone} />)}
        </div>
      </section>
    </>
  );
}
