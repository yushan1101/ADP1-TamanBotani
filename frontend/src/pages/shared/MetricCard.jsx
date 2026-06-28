import React from "react";
export function MetricCard({ icon: Icon, label, value, tone = "" }) {
  return <section className={`metricCard ${tone}`}><div className="metricIcon">{Icon && <Icon size={22}/>}</div><span>{label}</span><strong>{value}</strong></section>;
}
