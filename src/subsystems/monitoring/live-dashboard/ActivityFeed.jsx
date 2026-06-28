import React from "react";
import { useMonitoring } from "../../../context/MonitoringContext";

export function ActivityFeed() {
  const { system } = useMonitoring();
  const feed = system.activityFeed;

  return (
    <section className="panel auditFeedPanel spanThree">
      <div className="panelHeader auditFeedHeader">
        <div><h2>Movement Audit Log</h2><p>Latest verified entry, exit, and checkpoint records.</p></div>
        <span>Auto-refreshes every 5 seconds</span>
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
