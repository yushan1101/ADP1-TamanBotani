import React from "react";
export function SummaryTile({ label, value, note, tone }) {
  return (
    <div className={`summaryTile ${tone || ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <i>{note}</i>
    </div>
  );
}
