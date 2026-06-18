import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getSystemSnapshot } from "../data/uiData";
import { useToast } from "../components/ToastContext";

const MonitoringContext = createContext(null);

export function MonitoringProvider({ children }) {
  const { notify } = useToast();

  const [analyticsFilters, setAnalyticsFilters] = useState({
    period: "This month",
    type: "All types",
    purpose: "All purposes",
    holidays: "Holidays included"
  });

  const filtersRef = useRef(analyticsFilters);
  filtersRef.current = analyticsFilters;

  const [system, setSystem] = useState(() => getSystemSnapshot(analyticsFilters));
  
  useEffect(() => {
    setSystem(getSystemSnapshot(analyticsFilters));
  }, [analyticsFilters]);

  // Auto-refresh every 5 seconds (uses current filters)
  useEffect(() => {
    const id = setInterval(() => {
      setSystem(getSystemSnapshot(filtersRef.current));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const refreshAll = useCallback(() => {
    setSystem(getSystemSnapshot(filtersRef.current));
    notify("Live feed updated just now.", { title: "Refresh complete", tone: "good" });
  }, [notify]);

  return (
    <MonitoringContext.Provider value={{ system, analyticsFilters, setAnalyticsFilters, refreshAll }}>
      {children}
    </MonitoringContext.Provider>
  );
}

export function useMonitoring() {
  return useContext(MonitoringContext);
}
