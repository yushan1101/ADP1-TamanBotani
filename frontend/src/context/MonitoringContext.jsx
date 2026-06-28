// src/context/MonitoringContext.jsx
// Initial state is null/empty — shows "--" until real API data arrives.

import React, {
  createContext, useCallback, useContext,
  useEffect, useRef, useState
} from "react";
import { useToast } from "../components/ToastContext";
import { fetchLive, fetchAnalytics } from "../api/monitoringApi";

// Prototype data for journey & zone pages (no sensor integration yet)
import { getSystemSnapshot } from "../data/uiData";

const MonitoringContext = createContext(null);

// Empty/loading state — all numbers show "--" until first fetch completes
const EMPTY_STATE = {
  liveStats:    { visitors: null, capacity: null, alerts: null },
  zones:        [],
  activityFeed: [],
  analytics: {
    trendBars:     [],
    totalVisitors: null,
    trendSign:     "+",
    trendPct:      "0.0",
    weekendAvg:    null,
    avgDaily:      null,
    returning:     null,
    demSplit:      [0, 0],
    segments:      [],
    categoryRail:  [],
    peakHour:      null,
    peakDay:       null
  },
  // Prototype data for journey/zone — keep using uiData until sensor integration
  ...getSystemSnapshot({})
};

export function MonitoringProvider({ children }) {
  const { notify } = useToast();

  const [analyticsFilters, setAnalyticsFilters] = useState({
    period:   "This month",
    type:     "All types",
    purpose:  "All purposes",
    holidays: "Holidays included"
  });

  // Start with EMPTY_STATE so all numbers show "--" before first fetch
  const [system, setSystem]   = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const filtersRef = useRef(analyticsFilters);
  filtersRef.current = analyticsFilters;

  const loadSystem = useCallback(async (filters, silent = false) => {
    try {
      const [liveData, analyticsData] = await Promise.all([
        fetchLive(),
        fetchAnalytics(filters)
      ]);

      setSystem(prev => ({
        // Live dashboard — from real API
        liveStats:    liveData.liveStats,
        zones:        liveData.zones,
        activityFeed: liveData.activityFeed,

        // Analytics — from real API
        analytics: {
          trendBars:     analyticsData.trendBars,
          totalVisitors: analyticsData.totalVisitors,
          trendSign:     analyticsData.trendSign,
          trendPct:      analyticsData.trendPct,
          weekendAvg:    analyticsData.weekendAvg,
          avgDaily:      analyticsData.avgDaily,
          returning:     analyticsData.returning,
          demSplit:      analyticsData.demSplit,
          segments:      analyticsData.segments,
          categoryRail:  analyticsData.categoryRail,
          peakHour:      analyticsData.peakHour,
          peakDay:       analyticsData.peakDay
        },

        // Prototype — unchanged until IoT/sensor integration
        journey:     prev.journey,
        heatZones:   prev.heatZones,
        flowData:    prev.flowData,
        visitorRows: prev.visitorRows
      }));

      setError(null);
      if (!silent) setLoading(false);

    } catch (err) {
      console.error("MonitoringContext fetch failed:", err.message);
      setError(err.message);
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSystem(analyticsFilters);
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    loadSystem(analyticsFilters, true);
  }, [analyticsFilters]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const id = setInterval(() => {
      loadSystem(filtersRef.current, true);
    }, 10_000);
    return () => clearInterval(id);
  }, [loadSystem]);

  const refreshAll = useCallback(async () => {
    await loadSystem(filtersRef.current, true);
    notify("Live feed updated just now.", { title: "Refresh complete", tone: "good" });
  }, [loadSystem, notify]);

  return (
    <MonitoringContext.Provider value={{
      system,
      analyticsFilters,
      setAnalyticsFilters,
      refreshAll,
      loading,
      error
    }}>
      {children}
    </MonitoringContext.Provider>
  );
}

export function useMonitoring() {
  return useContext(MonitoringContext);
}