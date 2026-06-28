import React from "react";
import { AlertTriangle } from "lucide-react";
import { StatusItem } from "../../../components/StatusItem";
import { ZoneMini } from "../../../components/ZoneMini";
import { useMonitoring } from "../../../context/MonitoringContext";

export function ZoneList() {
  const { system } = useMonitoring();
  const { zones } = system;
  const highZone = zones.find(z => z.level === "High") || zones[0];

  return (
    <section className="panel">
      <div className="panelHeader">
        <div><h2>Zone Occupancy</h2><p>Status and threshold deviation.</p></div>
      </div>
      <div className="compactZoneList">
        {zones.map(zone => <ZoneMini key={zone.name} zone={zone} />)}
        <StatusItem icon={AlertTriangle} title="Abnormal traffic spike" text={`${highZone.name} is ${highZone.fill - 56}% above its usual 11 AM baseline.`} tone="warn" />
      </div>
    </section>
  );
}
