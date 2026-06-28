import React from "react";
import { ShieldCheck } from "lucide-react";
import { RatioBar } from "../../../components/RatioBar";
import { StatusItem } from "../../../components/StatusItem";
import { useMonitoring } from "../../../context/MonitoringContext";

export function DropOffAnalysis() {
  const { system } = useMonitoring();
  const { dropOff } = system.journey;
  const worst = dropOff[0];

  return (
    <section className="panel dropOffPanel">
      <div className="panelHeader"><div><h2>Drop-Off Points</h2><p>Zones where visits end early.</p></div></div>
      {dropOff.map(({ label, value }) => <RatioBar key={label} label={label} value={value} />)}
      <StatusItem icon={ShieldCheck} title="Experience weak point" text={`${worst.label} shows shortest dwell before exit.`} tone="warn" />
    </section>
  );
}
