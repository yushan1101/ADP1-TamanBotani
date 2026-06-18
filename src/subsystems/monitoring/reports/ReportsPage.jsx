import React from "react";
import { ReportBuilder } from "./ReportBuilder";
import { SchedulePanel } from "./SchedulePanel";
import { HistoryTable } from "./HistoryTable";

export function ReportsPage() {
  return (
    <div className="monitorDashboard">
      <ReportBuilder />
      <SchedulePanel />
      <HistoryTable />
    </div>
  );
}
