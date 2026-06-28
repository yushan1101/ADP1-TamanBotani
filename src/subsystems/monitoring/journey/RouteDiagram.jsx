import React from "react";

const STOPS = ["Main Gate", "Lake Trail", "Orchid Garden", "Cafe Court", "Exit Gate"];

export function RouteDiagram() {
  return (
    <section className="panel spanTwo">
      <div className="panelHeader"><div><h2>Dominant Route Flow</h2><p>Most common path from entrance to exit.</p></div></div>
      <div className="routeFlow">
        {STOPS.map((stop, index) => (
          <React.Fragment key={stop}>
            <div className="routeFlowStop">
              <span>{index + 1}</span>
              <strong>{stop}</strong>
            </div>
            {index < STOPS.length - 1 && <div className="routeFlowConnector" aria-hidden="true" />}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
