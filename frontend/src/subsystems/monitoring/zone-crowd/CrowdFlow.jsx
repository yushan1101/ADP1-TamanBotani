import React from "react";
import { useMonitoring } from "../../../context/MonitoringContext";

export function CrowdFlow() {
  const { system } = useMonitoring();
  const { flowData } = system;

  return (
    <section className="panel spanThree">
      <div className="panelHeader">
        <div><h2>Visitor Flow Between Zones</h2><p>Movement volume and average transit time.</p></div>
      </div>
      <div className="flowDiagram">
        {flowData.map(([from, to, volume, time]) => (
          <div className="flowRoute" key={`${from}-${to}`}>
            <strong>{from}</strong>
            <span />
            <strong>{to}</strong>
            <i>{volume} visitors · avg {time} min</i>
          </div>
        ))}
      </div>
    </section>
  );
}
