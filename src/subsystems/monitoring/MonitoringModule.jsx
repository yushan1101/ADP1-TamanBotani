import React from "react";
import { LiveDashboard } from "./live-dashboard/LiveDashboard";
import { MonitoringProviders } from "./MonitoringProviders";

function LiveMonitoringContent() {
  return <LiveDashboard />;
}

export function MonitoringModule() {
  return (
    <MonitoringProviders>
      <LiveMonitoringContent />
    </MonitoringProviders>
  );
}
