import React from "react";
import { ChevronLeft } from "lucide-react";

export function BackButton({ onBack, label = "Back to AI Management" }) {
  return (
    <button className="ghostButton" onClick={onBack} style={{ marginBottom: 20 }}>
      <ChevronLeft size={16} /> {label}
    </button>
  );
}

export function PageHeader({ icon: Icon, title, description }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div className="aiModuleCardIcon"><Icon size={20} /></div>
        <h2 style={{ margin: 0, fontSize: 22, color: "#1f3d2c" }}>{title}</h2>
      </div>
      <p style={{ marginLeft: 48 }}>{description}</p>
    </div>
  );
}

export function DayBadge({ type }) {
  const map = {
    "Weekend":        "warn",
    "Weekday":        "good",
    "Public Holiday": "danger",
  };
  return <span className={`aiBadge ${map[type] || "good"}`}>{type}</span>;
}