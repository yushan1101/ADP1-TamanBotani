import React from "react";
import { ToastProvider } from "../../components/ToastContext";
import { MonitoringProvider } from "../../context/MonitoringContext";

export function MonitoringProviders({ children }) {
  return (
    <ToastProvider>
      <MonitoringProvider>
        <div className="monitorWorkspace">{children}</div>
      </MonitoringProvider>
    </ToastProvider>
  );
}
