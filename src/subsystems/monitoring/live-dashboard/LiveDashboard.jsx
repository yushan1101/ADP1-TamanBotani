import React from "react";
import { AlertPanel } from "./AlertPanel";
import { LiveStats } from "./LiveStats";
import { ActivityFeed } from "./ActivityFeed";

export function LiveDashboard() {
  return (
    <div className="monitorDashboard">
      <LiveStats />
      <AlertPanel />
      <ActivityFeed />
    </div>
  );
}
