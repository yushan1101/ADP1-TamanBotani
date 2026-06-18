import React from "react";
import {
  Activity, ArrowUpRight, BarChart3, Bell, Bot, CalendarDays,
  FileText, Map, MessageSquare, Route, Search, Sparkles,
  TrendingDown, TrendingUp
} from "lucide-react";
import { MonitoringProviders } from "../../subsystems/monitoring/MonitoringProviders";
import { useMonitoring } from "../../context/MonitoringContext";
import { SummaryTile } from "../../components/SummaryTile";
import { StatusItem } from "../../components/StatusItem";
import { ZoneMini } from "../../components/ZoneMini";
import { EmptyState } from "../shared/EmptyState";

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
  const { liveStats, zones, analytics, journey } = system;

  const visitorsToday = appState.visits.reduce((sum, v) => sum + Number(v.count || 1), 0);
  const activeAlerts  = appState.alerts.filter(a => a.status === "Active");
  const newFeedback   = appState.feedback.filter(f => f.status === "New");
  const openCases     = appState.chatbotCases.filter(c => c.status !== "Resolved");

  const TrendIcon = analytics.trendSign === "-" ? TrendingDown : TrendingUp;

  return (
    <>
      <section className="monitorCommand">
        <div className="monitorCommandIntro">
          <span className="monitorLivePill"><Activity size={14} /> System healthy</span>
          <h2>{timeGreeting()}, here's how the park is doing</h2>
          <p>A live snapshot of attendance, crowd alerts, and visitor feedback across Taman Botani Johor, gathered in one place so nothing needs chasing across tabs.</p>
          <div className="monitorCommandActions">
            <button className="primaryButton" onClick={() => setPage("live")}>
              <Activity size={17} /> Open Live Monitoring
            </button>
            <button className="ghostButton" onClick={() => setPage("reports")}>
              <FileText size={17} /> View Reports
            </button>
          </div>
        </div>
        <div className="monitorCommandStats">
          <SummaryTile label="Visitors today"  value={visitorsToday.toString()}        note={`${liveStats.visitors} inside right now`} tone="good" />
          <SummaryTile label="Live occupancy"  value={`${liveStats.capacity}%`}        note="Of total park capacity" />
          <SummaryTile label="Active alerts"   value={activeAlerts.length.toString()}  note={activeAlerts.length ? "Needs staff attention" : "All clear"} tone={activeAlerts.length ? "danger" : "good"} />
          <SummaryTile label="New feedback"    value={newFeedback.length.toString()}   note={`${openCases.length} chatbot case${openCases.length === 1 ? "" : "s"} open`} />
        </div>
      </section>

      <div className="monitorDashboard">
        <section className="panel spanTwo">
          <div className="panelHeader">
            <div>
              <h2>Visitor Trend</h2>
              <p>Monthly visitor volume over the last 12 months.</p>
            </div>
            <span className={`badge ${analytics.trendSign === "-" ? "amber" : ""}`}>
              <TrendIcon size={14} /> {analytics.trendSign}{analytics.trendPct}% vs last period
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
            {zones.map(zone => <ZoneMini key={zone.name} zone={zone} />)}
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div><h2>Recent Alerts</h2><p>Latest items needing review.</p></div>
          </div>
          {appState.alerts.length === 0 ? (
            <EmptyState icon={Bell} title="No alerts" text="Nothing needs attention right now." />
          ) : appState.alerts.slice(0, 4).map(alert => (
            <div className="feedItem" key={alert.id}>
              <strong>{alert.message}</strong>
              <span>{alert.time} · {alert.severity}</span>
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
          {appState.feedback.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No feedback yet" text="New visitor feedback will show up here." />
          ) : appState.feedback.slice(0, 4).map(fb => (
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
            <div><h2>AI Highlights</h2><p>Predictions and automated signals.</p></div>
          </div>
          <div className="statusStack">
            <StatusItem icon={Sparkles} tone="good" title="Next peak expected this weekend" text={`Weekend staffing should plan for around ${analytics.weekendAvg} average visitors.`} />
            <StatusItem icon={Bot} tone={openCases.length ? "warn" : "good"} title={`${openCases.length} chatbot case${openCases.length === 1 ? "" : "s"} open`} text="Lost items and visitor questions awaiting a reply." />
            <StatusItem icon={CalendarDays} tone={journey.anomalies ? "warn" : "good"} title={`Journey score ${journey.score}`} text={`${journey.anomalies} stay-duration review${journey.anomalies === 1 ? "" : "s"} flagged this week.`} />
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
    <MonitoringProviders>
      <OverviewContent appState={appState} setPage={setPage} />
    </MonitoringProviders>
  );
}
