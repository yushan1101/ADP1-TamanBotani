import React from "react";
import { VisitorTrendChart } from "./VisitorTrendChart";
import { Demographics } from "./Demographics";
import { PeakHours } from "./PeakHours";

export function AnalyticsPage() {
  return (
    <div className="monitorDashboard">
      <VisitorTrendChart />
      <Demographics />
      <PeakHours />
    </div>
  );
}
