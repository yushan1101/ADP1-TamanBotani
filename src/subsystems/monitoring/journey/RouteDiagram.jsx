import React from "react";
export function RouteDiagram() {
  return (
    <section className="panel spanTwo">
      <div className="panelHeader"><div><h2>Dominant Route Flow</h2><p>Most common path from entrance to exit.</p></div></div>
      <div className="routeCanvas">
        {["Main Gate", "Lake Trail", "Orchid Garden", "Cafe Court", "Exit Gate"].map((stop, index) => (
          <div className={`routeStop stop${index + 1}`} key={stop}>
            <span>{index + 1}</span>
            <strong>{stop}</strong>
          </div>
        ))}
        <div className="routeLine one" />
        <div className="routeLine two" />
        <div className="routeLine three" />
        <div className="routeLine four" />
      </div>
    </section>
  );
}
