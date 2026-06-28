import React from "react";
import { useMonitoring } from "../../../context/MonitoringContext";

export function DwellTimeChart() {
  const { system } = useMonitoring();
  const { dwellDist } = system.journey;

  return (
    <section className="panel spanTwo">
      <div className="panelHeader"><div><h2>Dwell Time Distribution</h2><p>Grouped by visitor duration segment.</p></div></div>
      <div className="dwellBars">
        {dwellDist.map(({ label, value }) => (
          <div className="dwellBar" key={label}>
            <span style={{ height: `${value}%` }} />
            <strong>{label}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
