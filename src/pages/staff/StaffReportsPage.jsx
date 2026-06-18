import React from "react";
import { MonitoringProviders } from "../../subsystems/monitoring/MonitoringProviders";
import { ReportsPage } from "../../subsystems/monitoring/reports/ReportsPage";

export function StaffReportsPage() {
  return (
    <MonitoringProviders>
      <ReportsPage />
    </MonitoringProviders>
  );
}
