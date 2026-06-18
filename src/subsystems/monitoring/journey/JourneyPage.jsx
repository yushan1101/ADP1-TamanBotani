import React, { useState } from "react";
import { SummaryTile } from "../../../components/SummaryTile";
import { RouteDiagram } from "./RouteDiagram";
import { DropOffAnalysis } from "./DropOffAnalysis";
import { DwellTimeChart } from "./DwellTimeChart";
import { useMonitoring } from "../../../context/MonitoringContext";

const journeyFilterGroups = [
  { id: "range",    options: ["Last 30 days", "Last 7 days", "Last 90 days"] },
  { id: "category", options: ["All visitor categories", "Individuals", "Groups", "School groups"] },
  { id: "window",   options: ["Peak vs off-peak", "Peak only", "Off-peak only"] }
];

export function JourneyPage() {
  const { system } = useMonitoring();
  const data = system.journey;

  const [selected, setSelected] = useState({
    range:    "Last 30 days",
    category: "All visitor categories",
    window:   "Peak vs off-peak"
  });
  const [justChanged, setJustChanged] = useState("");

  function cycle(groupId) {
    const group = journeyFilterGroups.find(g => g.id === groupId);
    const next  = group.options[(group.options.indexOf(selected[groupId]) + 1) % group.options.length];
    setSelected(prev => ({ ...prev, [groupId]: next }));
    setJustChanged(groupId);
    setTimeout(() => setJustChanged(""), 600);
  }

  return (
    <div className="monitorDashboard">
      <section className="journeyHero spanThree">
        <div className="journeyHeroCopy">
          <span className="sectionKicker">Journey analysis</span>
          <h2>Route quality and visitor experience signals</h2>
          <p>Journey data highlights which routes perform well, where visitors leave early, and which stays need staff review.</p>
          <div className="filterGrid">
            {journeyFilterGroups.map(group => (
              <button
                className={justChanged === group.id ? "filterChip active" : "filterChip"}
                key={group.id}
                onClick={() => cycle(group.id)}
                title="Click to cycle options"
              >
                {selected[group.id]}
              </button>
            ))}
          </div>
        </div>
        <div className="journeyScoreCard">
          <span>Experience score</span>
          <strong>{data.score}</strong>
          <i>Stable, with {data.anomalies} stay-duration review{data.anomalies !== 1 ? "s" : ""}</i>
        </div>
      </section>

      <RouteDiagram />

      <section className="panel">
        <div className="panelHeader"><div><h2>Journey KPIs</h2><p>Active experience indicators.</p></div></div>
        <div className="journeyKpis">
          <SummaryTile label="Average dwell time" value={data.dwell}            note="Families: 2h 12m" />
          <SummaryTile label="New visitors"        value={`${100 - data.returning}%`} note={`Returning: ${data.returning}%`} />
          <SummaryTile label="Active anomalies"    value={data.anomalies}       note="Stay duration review" tone="danger" />
        </div>
      </section>

      <section className="panel spanThree">
        <div className="panelHeader"><div><h2>Top Movement Paths</h2><p>Route sequences ranked by completion rate.</p></div></div>
        <div className="journeyPathGrid">
          {data.routes.map(path => (
            <div className="journeyPathCard" key={path.slice(0,4).join("-")}>
              <div>{path.slice(0, 4).map(stop => <span key={stop}>{stop}</span>)}</div>
              <strong>{path[4]}%</strong>
            </div>
          ))}
        </div>
      </section>

      <DropOffAnalysis />
      <DwellTimeChart />
    </div>
  );
}
