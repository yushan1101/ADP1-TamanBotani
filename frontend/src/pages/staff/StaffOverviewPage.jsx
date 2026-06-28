import React, { useEffect, useState } from "react";
import {
  Activity, ArrowUpRight, BarChart3, Bell, Bot, CalendarDays,
  FileText, Map, MessageSquare, Route, Search, Users,
  TrendingDown, TrendingUp, RefreshCw
} from "lucide-react";
import { useMonitoring } from "../../context/MonitoringContext";
import { SummaryTile } from "../../components/SummaryTile";
import { StatusItem } from "../../components/StatusItem";
import { ZoneMini } from "../../components/ZoneMini";
import { EmptyState } from "../shared/EmptyState";
import { fetchOverview } from "../../api/monitoringApi";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const quickLinks = [
  { id: "live",      icon: Activity,      title: "Live Monitoring",      text: "Occupancy, alerts, and the live activity feed." },
  { id: "analytics", icon: BarChart3,     title: "Visitor Analytics",    text: "Trends, demographics, and peak hour patterns." },
  { id: "zones",     icon: Map,           title: "Zone & Crowd",         text: "Heatmap, zone load, and crowd flow." },
  { id: "records",   icon: Search,        title: "Visitor Records",      text: "Search and trace any visitor or group." },
  { id: "journey",   icon: Route,         title: "Journey & Experience", text: "Route quality and drop-off signals." },
  { id: "reports",   icon: FileText,      title: "Reports",              text: "Build, schedule, and export reports." },
  { id: "forecast",  icon: TrendingUp,    title: "Forecasting",          text: "Predicted visitor volume ahead." },
  { id: "feedback",  icon: MessageSquare, title: "Feedback",             text: "Visitor sentiment and open cases." }
];

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function OverviewContent({ appState, setPage }) {
  const { system } = useMonitoring();
  const { analytics, journey } = system;

  // ── Real overview data from /api/overview ─────────────────
  const [overview, setOverview] = useState(null);
  const [ovLoading, setOvLoading] = useState(true);
  const [ovError,   setOvError]   = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  async function loadOverview() {
    try {
      const data = await fetchOverview();
      setOverview(data);
      setOvError(null);
      setLastRefresh(new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      setOvError(err.message);
    } finally {
      setOvLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
    // Refresh every 30 seconds
    const id = setInterval(loadOverview, 30_000);
    return () => clearInterval(id);
  }, []);

  // Fallback values while loading
  const kpi          = overview?.kpi          ?? {};
  const zones        = overview?.zones        ?? [];
  const recentAlerts = overview?.recentAlerts ?? [];

  const todayTotal   = kpi.todayTotal   ?? 0;
  // Use live stats from MonitoringContext (same source as Live Monitoring page)
  // so Overview and Live Monitoring always show the same numbers
  const liveVisitors = system.liveStats?.visitors ?? kpi.liveVisitors ?? 0;
  const liveCapacity = system.liveStats?.capacity ?? kpi.liveCapacity ?? 0;
  const activeAlerts = system.liveStats?.alerts   ?? kpi.activeAlerts ?? 0;
  const trendSign    = kpi.trendSign    ?? "+";
  const trendPct     = kpi.trendPct     ?? "0.0";
  const monthTotal   = kpi.monthTotal   ?? 0;
  const avgDaily     = kpi.avgDaily     ?? 0;

  // Non-monitoring data still from appState (feedback, chatbot)
  const newFeedback  = (appState.feedback || []).filter(f => f.status === "New");
  const openCases    = (appState.chatbotCases || []).filter(c => c.status !== "Resolved");

  const TrendIcon = trendSign === "-" ? TrendingDown : TrendingUp;

  return (
    <>
      <section className="overviewCommand">
        <div className="overviewHeroText">
          <span className="monitorLivePill"><Activity size={14} /> Operations status: live</span>
          <h2>{timeGreeting()}, Taman Botani Johor is operating normally.</h2>
          <p>One-page management overview for visitor load, active alerts, feedback, and priority modules.</p>
        </div>
        <div className="overviewHeroActions">
          <button className="primaryButton" onClick={() => setPage("live")}>
            <Activity size={17} /> Open Live Monitoring
          </button>
          <button className="ghostButton" onClick={() => setPage("reports")}>
            <FileText size={17} /> View Reports
          </button>
        </div>

        {ovError && (
          <div className="errorBanner" style={{ marginTop: 12 }}>
            ⚠️ Could not load overview data: {ovError}
            <button className="ghostButton" onClick={loadOverview} style={{ marginLeft: 8 }}>Retry</button>
          </div>
        )}

        <div className="overviewKpiStrip">
          <div className="overviewKpiItem">
            <Users size={17} />
            <span>Today's visitors</span>
            <strong>{ovLoading ? "—" : todayTotal.toLocaleString()}</strong>
            <i>{trendSign}{trendPct}% vs yesterday</i>
          </div>
          <div className="overviewKpiItem">
            <Activity size={17} />
            <span>Live occupancy</span>
            <strong>{ovLoading ? "—" : `${liveCapacity}%`}</strong>
            <i>{liveVisitors} inside now</i>
          </div>
          <button
            className={`overviewKpiItem clickable ${activeAlerts > 0 ? "danger" : ""}`}
            onClick={() => setPage("alerts")}
          >
            <Bell size={17} />
            <span>Active alerts</span>
            <strong>{ovLoading ? "—" : activeAlerts}</strong>
            <i>{activeAlerts ? "Open alert page" : "All clear"}</i>
          </button>
          <div className="overviewKpiItem">
            <BarChart3 size={17} />
            <span>This month</span>
            <strong>{ovLoading ? "—" : monthTotal.toLocaleString()}</strong>
            <i>~{avgDaily}/day avg</i>
          </div>
        </div>
        {lastRefresh && (
          <div style={{ fontSize: 11, color: "var(--neutral-500)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <RefreshCw size={10} /> Auto-refreshed at {lastRefresh}
          </div>
        )}
      </section>

      <div className="monitorDashboard">
        <section className="panel spanTwo">
          <div className="panelHeader">
            <div>
              <h2>Visitor Trend</h2>
              <p>Monthly visitor volume over the last 12 months.</p>
            </div>
            <span className={`badge ${trendSign === "-" ? "amber" : ""}`}>
              <TrendIcon size={14} /> {trendSign}{trendPct}% vs last period
            </span>
          </div>
          <div className="analyticsSpark" aria-label="Monthly visitor trend">
            {analytics.trendBars.map((height, i) => (
              <span key={monthLabels[i]} style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="chartLabels">
            {monthLabels.map(m => <span key={m}>{m}</span>)}
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div><h2>Zone Snapshot</h2><p>Live capacity by area.</p></div>
          </div>
          <div className="compactZoneList">
            {ovLoading
              ? <p style={{ color: "var(--neutral-400)", fontSize: 13 }}>Loading zones…</p>
              : zones.length === 0
                ? <EmptyState icon={Map} title="No zone data" text="Zone occupancy will appear once visits are active." />
                : zones.map(zone => <ZoneMini key={zone.name} zone={zone} />)
            }
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div><h2>Recent Alerts</h2><p>Latest items needing review.</p></div>
          </div>
          {ovLoading ? (
            <p style={{ color: "var(--neutral-400)", fontSize: 13 }}>Loading alerts…</p>
          ) : recentAlerts.length === 0 ? (
            <EmptyState icon={Bell} title="No alerts" text="Nothing needs attention right now." />
          ) : recentAlerts.map(alert => (
            <div className="feedItem" key={alert.id}>
              <strong>{alert.message}</strong>
              <span>{new Date(alert.created_at).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })} · {alert.zone_name} · {alert.severity}</span>
            </div>
          ))}
          <button className="ghostButton overviewLinkButton" onClick={() => setPage("alerts")}>
            View all alerts <ArrowUpRight size={16} />
          </button>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div><h2>Recent Feedback</h2><p>What visitors are saying.</p></div>
          </div>
          {newFeedback.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No feedback yet" text="New visitor feedback will show up here." />
          ) : newFeedback.slice(0, 4).map(fb => (
            <div className="feedItem" key={fb.id}>
              <strong>{fb.visitor} · {fb.category}</strong>
              <span>{fb.text}</span>
            </div>
          ))}
          <button className="ghostButton overviewLinkButton" onClick={() => setPage("feedback")}>
            View all feedback <ArrowUpRight size={16} />
          </button>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div><h2>Operational Signals</h2><p>Cross-system flags relevant to today's operations.</p></div>
          </div>
          <div className="statusStack">
            <StatusItem icon={TrendingUp} tone="good" title="Next peak expected this weekend" text={`Weekend staffing should plan for around ${analytics.weekendAvg || avgDaily} average visitors.`} />
            <StatusItem icon={Bot} tone={openCases.length ? "warn" : "good"} title={`${openCases.length} chatbot case${openCases.length === 1 ? "" : "s"} open`} text="Lost items and visitor questions awaiting a reply." />
            <StatusItem icon={CalendarDays} tone={journey?.anomalies ? "warn" : "good"} title={`Journey score ${journey?.score ?? "—"}`} text={`${journey?.anomalies ?? 0} stay-duration review${journey?.anomalies === 1 ? "" : "s"} flagged this week.`} />
          </div>
        </section>

        <section className="panel spanThree">
          <div className="panelHeader">
            <div><h2>Quick Links</h2><p>Jump straight into any module.</p></div>
          </div>
          <div className="dashboardGrid">
            {quickLinks.map(({ id, icon: Icon, title, text }) => (
              <button className="overviewCard" key={id} onClick={() => setPage(id)}>
                <Icon /><strong>{title}</strong><span>{text}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function StaffOverviewPage({ appState, setPage }) {
  return (
    <OverviewContent appState={appState} setPage={setPage} />
  );
}