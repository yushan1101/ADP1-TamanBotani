import React from "react";
import { MonitoringProviders } from "../../subsystems/monitoring/MonitoringProviders";
import { VisitorRecordsPage } from "../../subsystems/monitoring/visitor-records/VisitorRecordsPage";

export function StaffVisitorRecordsPage() {
  return (
    <MonitoringProviders>
      <VisitorRecordsPage />
    </MonitoringProviders>
  );
}
