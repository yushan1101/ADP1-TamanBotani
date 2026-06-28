import React from "react";
import { Clock, CalendarDays, Users } from "lucide-react";
import { StatusItem } from "../../../components/StatusItem";
import { SummaryTile } from "../../../components/SummaryTile";
import { useMonitoring } from "../../../context/MonitoringContext";

export function PeakHours() {
  const { system } = useMonitoring();
  const { peakHour, peakDay, returning, avgDaily } = system.analytics;

  return (
    <section className="panel">
      <div className="panelHeader">
        <div><h2>Peak Signals</h2><p>Time patterns that affect staff allocation.</p></div>
      </div>
      <div className="peakHighlights">
        <StatusItem icon={Clock}        title="Peak hour"       text={peakHour}  tone="warn" />
        <StatusItem icon={CalendarDays} title="Peak day"        text={peakDay}   tone="good" />
        <StatusItem icon={Users}        title="Returning ratio" text={`${returning}% returning visitors this period.`} tone="good" />
      </div>
      <div style={{ marginTop: "1rem" }}>
        <SummaryTile label="Average daily"  value={avgDaily.toString()} note="Weekday baseline" />
        <SummaryTile label="Top nationality" value="Malaysia"           note="74% of visitors" />
        <SummaryTile label="Top purpose"    value="Recreation"          note="38% of visits" />
      </div>
    </section>
  );
}
