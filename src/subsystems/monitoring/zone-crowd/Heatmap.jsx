import React from "react";
import { useMonitoring } from "../../../context/MonitoringContext";

export function Heatmap() {
  const { system } = useMonitoring();
  const hz = system.heatZones;
  const byName = Object.fromEntries(hz.map(z => [z.name, z.fill]));

  return (
    <section className="panel spanTwo">
      <div className="panelHeader">
        <div><h2>Crowd Heatmap</h2><p>Interactive park zone density overlay.</p></div>
        <span className="countBadge">Realtime</span>
      </div>
      <div className="heatmapCanvas">
        <div className="parkLake" />
        <div className="parkTrail main" />
        <div className="parkTrail branch" />
        <div className="heatBlob hot" />
        <div className="heatBlob warm" />
        <div className="heatBlob cool" />
        <div className="heatBlob mid" />
        <div className="heatZone gate">  <strong>Main Gate</strong>     <span>{byName["Main Gate"] ?? 82}%</span></div>
        <div className="heatZone lake">  <strong>Lake Trail</strong>    <span>{byName["Lake Trail"] ?? 55}%</span></div>
        <div className="heatZone orchid"><strong>Orchid Garden</strong> <span>{byName["Orchid Garden"] ?? 34}%</span></div>
        <div className="heatZone herb">  <strong>Herbarium</strong>     <span>{byName["Herbarium"] ?? 62}%</span></div>
        <div className="heatZone cafe">  <strong>Cafe Court</strong>    <span>{byName["Cafe Court"] ?? 47}%</span></div>
        <div className="heatLegend">
          <span><i className="legendHot" /> High</span>
          <span><i className="legendWarm" /> Moderate</span>
          <span><i className="legendCool" /> Normal</span>
        </div>
      </div>
    </section>
  );
}
