import React from "react";
import { MonitoringProviders } from "../../subsystems/monitoring/MonitoringProviders";
import { AnalyticsPage } from "../../subsystems/monitoring/analytics/AnalyticsPage";

export function StaffAnalyticsPage() {
  return (
    <MonitoringProviders>
      <AnalyticsPage />
    </MonitoringProviders>
  );
}
