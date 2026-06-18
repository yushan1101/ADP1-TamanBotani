import React from "react";
import { ChevronRight } from "lucide-react";
import { VisitorDetail } from "./VisitorDetail";
import { visitorRows as allVisitorRows } from "../data/uiData";

export function VisitorTable({ rows, expandedVisitor, setExpandedVisitor }) {
  const visitorRows = rows || allVisitorRows;
  return (
    <table className="dataTable">
      <thead>
        <tr><th></th><th>ID</th><th>Name</th><th>Type</th><th>Purpose</th><th>Status</th><th>Last checkpoint</th><th>Alert</th></tr>
      </thead>
      <tbody>
        {visitorRows.map((row) => (
          <React.Fragment key={row[0]}>
            <tr
              className={expandedVisitor === row[0] ? "selectedRow" : ""}
              onClick={() => setExpandedVisitor(expandedVisitor === row[0] ? "" : row[0])}
            >
              <td><ChevronRight size={16} className={expandedVisitor === row[0] ? "open" : ""} /></td>
              <td><strong>{row[0]}</strong></td>
              <td>{row[1]}</td>
              <td>{row[6]}</td>
              <td>{row[2]}</td>
              <td className="statusCell">{row[3]}</td>
              <td>{row[4]}</td>
              <td>
                <span className={`aiBadge ${row[6] === "Long stay" ? "warn" : row[6] === "Closed" ? "" : "good"}`}>
                  <div className="aiBadgeDot" />{row[6]}
                </span>
              </td>
            </tr>
            {expandedVisitor === row[0] && (
              <tr className="expandedRecordRow">
                <td colSpan="8"><VisitorDetail row={row} /></td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}