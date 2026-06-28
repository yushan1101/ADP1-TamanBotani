import React from "react";
import { RatioBar } from "../../../components/RatioBar";
import { useMonitoring } from "../../../context/MonitoringContext";

export function Demographics() {
  const { system } = useMonitoring();
  const { segments, categoryRail } = system.analytics;

  return (
    <section className="panel spanTwo">
      <div className="panelHeader">
        <div><h2>Visitor Mix</h2><p>Profile split used for facilities and program planning.</p></div>
      </div>
      <div className="segmentGrid">
        {segments.map(([label, value, note]) => (
          <div className="segmentCard" key={label}>
            <div><strong>{value}%</strong><span>{label}</span></div>
            <p>{note}</p>
            <div className="meter"><i style={{ width: `${value}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="panelHeader" style={{ marginTop: "1rem" }}>
        <div><h2>Category Volume</h2><p>Comparison across visitor groups.</p></div>
      </div>
      <div className="categoryRail">
        {categoryRail.map(([label, value]) => <RatioBar key={label} label={label} value={value} />)}
      </div>
    </section>
  );
}
