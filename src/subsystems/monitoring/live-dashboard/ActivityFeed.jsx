import React from "react";
import { useMonitoring } from "../../../context/MonitoringContext";

export function ActivityFeed() {
  const { system } = useMonitoring();
  const feed = system.activityFeed;

  return (
    <section className="panel spanThree">
      <div className="panelHeader">
        <div><h2>Live Activity Feed</h2><p>Latest check-ins, exits, and zone movements.</p></div>
      </div>
      <div className="activityTimeline">
        {feed.map(([time, text, type]) => (
          <div className={`activityEvent ${type.toLowerCase()}`} key={`${time}-${text}`}>
            <span>{time}</span>
            <strong>{text}</strong>
            <i>{type}</i>
          </div>
        ))}
      </div>
    </section>
  );
}
