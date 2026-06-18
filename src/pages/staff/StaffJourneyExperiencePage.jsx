import React from "react";
import { MonitoringProviders } from "../../subsystems/monitoring/MonitoringProviders";
import { JourneyPage } from "../../subsystems/monitoring/journey/JourneyPage";

export function StaffJourneyExperiencePage() {
  return (
    <MonitoringProviders>
      <JourneyPage />
    </MonitoringProviders>
  );
}
