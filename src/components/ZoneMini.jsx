import React from "react";
export function ZoneMini({ zone }) {
  return (
    <div className={`zoneMini ${zone.level.toLowerCase()}`}>
      <div>
        <strong>{zone.name}</strong>
        <span>{zone.count} visitors</span>
      </div>
      <div className="meter"><i style={{ width: `${zone.fill}%` }} /></div>
      <small className={zone.level.toLowerCase()}>{zone.level}</small>
    </div>
  );
}
