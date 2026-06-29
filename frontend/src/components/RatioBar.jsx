import React from "react";
export function RatioBar({ label, value }) {
  return (
    <div className="ratioBar">
      <div><span>{label}</span><strong>{value}%</strong></div>
      <div className="meter"><i style={{ width: `${value}%` }} /></div>
    </div>
  );
}
