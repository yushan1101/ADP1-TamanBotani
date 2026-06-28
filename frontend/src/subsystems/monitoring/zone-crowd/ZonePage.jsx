import React from "react";
import { Heatmap } from "./Heatmap";
import { ZoneList } from "./ZoneList";
import { CrowdFlow } from "./CrowdFlow";

export function ZonePage() {
  return (
    <div className="monitorDashboard">
      <Heatmap />
      <ZoneList />
      <CrowdFlow />
    </div>
  );
}
