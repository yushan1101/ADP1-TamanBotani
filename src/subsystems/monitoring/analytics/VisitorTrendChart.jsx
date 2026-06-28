import React from "react";
import { useMonitoring } from "../../../context/MonitoringContext";

const filterGroups = [
  { id: "period",   options: ["This month", "Last month", "This quarter"] },
  { id: "type",     options: ["All types", "Individual", "Group"] },
  { id: "purpose",  options: ["All purposes", "Recreation", "Education"] },
  { id: "holidays", options: ["Holidays included", "Holidays excluded"] }
];

export function VisitorTrendChart() {
  const { system, analyticsFilters, setAnalyticsFilters } = useMonitoring();
  const { trendBars, totalVisitors, trendSign, trendPct, weekendAvg } = system.analytics;

  function cycle(groupId) {
    const group = filterGroups.find(g => g.id === groupId);
    const cur   = analyticsFilters[groupId];
    const next  = group.options[(group.options.indexOf(cur) + 1) % group.options.length];
    setAnalyticsFilters(prev => ({ ...prev, [groupId]: next }));
  }

  return (
    <section className="analyticsHero spanThree">
      <div className="analyticsHeroMain">
        <div className="panelHeader compactHeader">
          <div>
            <span className="sectionKicker">Demographic analytics</span>
            <h2>Visitor demand by time, purpose, and profile</h2>
          </div>
          <div className="filterGrid">
            {filterGroups.map(group => (
              <button
                className={`filterChip`}
                key={group.id}
                onClick={() => cycle(group.id)}
                title="Click to cycle options"
              >
                {analyticsFilters[group.id]}
              </button>
            ))}
          </div>
        </div>
        <div className="analyticsFocus">
          <div>
            <span>Total visitors</span>
            <strong>{totalVisitors.toLocaleString()}</strong>
            <i>{trendSign}{trendPct}% vs prev</i>
          </div>
          <div className="analyticsSpark" aria-label="Monthly visitor trend chart">
            {trendBars.map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="chartLabels analyticsMonths">
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
      <aside className="analyticsInsightRail">
        <div className="insightCard primary">
          <span>Operational insight</span>
          <strong>Weekend staffing should be prepared for {weekendAvg} average visitors.</strong>
        </div>
      </aside>
    </section>
  );
}
