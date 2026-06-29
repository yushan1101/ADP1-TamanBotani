import React from "react";

export function SummaryTile({ label, value, note, tone, trend, compare }) {
  const isUp = trend && trend.startsWith("+");
  const isDown = trend && trend.startsWith("-");
  return (
    <div className={`summaryTile ${tone || ""}`}>
      <span className="summaryTileLabel">{label}</span>
      <strong>{value}</strong>
      {trend && (
        <span className={`summaryTileTrend ${isUp ? "trendUp" : isDown ? "trendDown" : ""}`}>
          {trend}
        </span>
      )}
      <i>{compare || note}</i>
    </div>
  );
}
