import React from "react";
import { MonitoringProviders } from "../../subsystems/monitoring/MonitoringProviders";
import { ZonePage } from "../../subsystems/monitoring/zone-crowd/ZonePage";

export function StaffZoneCrowdPage() {
  return (
    <MonitoringProviders>
      <ZonePage />
    </MonitoringProviders>
  );
}
