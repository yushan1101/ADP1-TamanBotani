import React, { useState, useEffect } from "react";
import { StaffDashboardLayout } from "./StaffDashboardLayout";
import { StaffLoginPage } from "./StaffLoginPage";
import { StaffOverviewPage } from "./StaffOverviewPage";
import { StaffLiveMonitoringPage } from "./StaffLiveMonitoringPage";
import { StaffAnalyticsPage } from "./StaffAnalyticsPage";
import { StaffZoneCrowdPage } from "./StaffZoneCrowdPage";
import { StaffVisitorRecordsPage } from "./StaffVisitorRecordsPage";
import { StaffJourneyExperiencePage } from "./StaffJourneyExperiencePage";
import { StaffReportsPage } from "./StaffReportsPage";
import { StaffForecastingPage } from "./StaffForecastingPage";
import { StaffCrowdAlertsPage } from "./StaffCrowdAlertsPage";
import { StaffPeakSeasonPage } from "./StaffPeakSeasonPage";
import { StaffChatbotManagementPage } from "./StaffChatbotManagementPage";
import { StaffFeedbackManagementPage } from "./StaffFeedbackManagementPage";
import { getToken, getUser, clearToken, verifyToken } from "../../api/monitoringApi";
import { MonitoringProviders } from "../../subsystems/monitoring/MonitoringProviders";

export function StaffApp({ appState, setAppState, onBack }) {
  const [page, setPage] = useState("overview");

  // ── Auth state ────────────────────────────────────────────
  // "checking" = we haven't confirmed the stored token with the backend yet.
  // We do NOT trust localStorage alone — a token can be expired or revoked
  // even though it's still sitting in the browser.
  const [authStatus, setAuthStatus] = useState("guest");
  const [authUser, setAuthUser] = useState(() => getUser());

  useEffect(() => {
    if (authStatus !== "checking") return;

    let cancelled = false;
    verifyToken()
      .then((res) => {
        if (cancelled) return;
        if (res?.valid) {
          setAuthStatus("authed");
        } else {
          clearToken();
          setAuthUser(null);
          setAuthStatus("guest");
        }
      })
      .catch(() => {
        // Token expired, invalid, or backend unreachable for auth check —
        // treat as logged-out rather than silently letting the dashboard show.
        if (cancelled) return;
        clearToken();
        setAuthUser(null);
        setAuthStatus("guest");
      });

    return () => { cancelled = true; };
  }, [authStatus]);

  function handleLoginSuccess(user) {
    setAuthUser(user);
    setAuthStatus("authed");
  }

  function handleLogout() {
    clearToken();
    setAuthUser(null);
    setAuthStatus("guest");
    setPage("overview");
  }

  // ── Still verifying stored token with backend ────────────
  if (authStatus === "checking") {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", fontSize: "0.95rem", color: "#666"
      }}>
        Checking session…
      </div>
    );
  }

  // ── Not logged in (or token expired/invalid): show login page ───
  if (authStatus !== "authed") {
    return <StaffLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // ── Logged in: show dashboard ─────────────────────────────
  const titles = {
    overview:  "Dashboard Overview",
    live:      "Live Monitoring",
    analytics: "Visitor Analytics",
    zones:     "Zone & Crowd Monitoring",
    records:   "Visitor Records",
    journey:   "Journey & Experience",
    reports:   "Reports",
    forecast:  "Visitor Forecasting",
    alerts:    "Peak Crowd Alerts",
    season:    "Peak Season Prediction",
    chatbot:   "Chatbot Management",
    feedback:  "Feedback Management"
  };

  const props = { appState, setAppState, setPage };

  const views = {
    overview:  <StaffOverviewPage {...props} />,
    live:      <StaffLiveMonitoringPage {...props} />,
    analytics: <StaffAnalyticsPage {...props} />,
    zones:     <StaffZoneCrowdPage {...props} />,
    records:   <StaffVisitorRecordsPage {...props} />,
    journey:   <StaffJourneyExperiencePage {...props} />,
    reports:   <StaffReportsPage {...props} />,
    forecast:  <StaffForecastingPage {...props} />,
    alerts:    <StaffCrowdAlertsPage {...props} />,
    season:    <StaffPeakSeasonPage {...props} />,
    chatbot:   <StaffChatbotManagementPage {...props} />,
    feedback:  <StaffFeedbackManagementPage {...props} />
  };

  return (
    <MonitoringProviders>
      <StaffDashboardLayout
        page={page}
        setPage={setPage}
        title={titles[page]}
        onBack={onBack}
        authUser={authUser}
        onLogout={handleLogout}
      >
        {views[page]}
      </StaffDashboardLayout>
    </MonitoringProviders>
  );
}