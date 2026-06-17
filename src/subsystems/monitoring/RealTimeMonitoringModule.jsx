import React from "react";
import { Activity, AlertTriangle, RefreshCw, Users } from "lucide-react";
import { liveHeadCount, zones } from "../../data/appState";
import { MetricCard } from "../../pages/shared/MetricCard";
export function RealTimeMonitoringModule({ appState }) {
  const live = liveHeadCount(appState.visits); const capacity = 500; const pct = Math.round((live/capacity)*100);
  return <section className="panel"><div className="sectionHead"><div><p className="eyebrow">Subsystem 2</p><h2>Real-Time Monitoring Dashboard</h2><p>Live occupancy, activity feed, current park capacity and high-density alerts.</p></div><button className="secondaryButton"><RefreshCw size={18}/> Refresh</button></div><div className="metricRow"><MetricCard icon={Users} label="Current Visitors" value={live}/><MetricCard icon={Activity} label="Occupancy" value={`${pct}%`}/><MetricCard icon={AlertTriangle} label="Active Alerts" value={appState.alerts.filter(a=>a.status==="Active").length} tone="amber"/><MetricCard icon={Users} label="Park Capacity" value={capacity}/></div><div className="split"><div className="subPanel"><h3>Live Activity Feed</h3>{appState.visits.slice(0,5).map(v=><div className="feedItem" key={v.id}><span>{v.checkInTime}</span><strong>{v.name}</strong><em>{v.channel} check-in at {v.zone}</em></div>)}</div><div className="subPanel"><h3>Current Occupancy by Zone</h3>{zones.map(z=><div className="ratioLine" key={z.name}><span>{z.name}</span><b>{z.count}/{z.capacity}</b><progress value={z.count} max={z.capacity}/></div>)}</div></div></section>;
}
