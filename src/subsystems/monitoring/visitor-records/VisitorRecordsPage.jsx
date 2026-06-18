import React from "react";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { VisitorTable } from "./VisitorTable";
import { RatioBar } from "../../../components/RatioBar";
import { visitorRows } from "../data/uiData";

export function VisitorRecordsPage() {
  const [expandedVisitor, setExpandedVisitor] = useState("G-204");
  const [filters, setFilters] = useState({ type: "All types", date: "Today", purpose: "All purposes" });
  const selectedVisitor = visitorRows.find((row) => row[0] === expandedVisitor) || visitorRows[2];

  const filteredRows = visitorRows.filter((row) => {
    const [, , purpose, , , , tag] = row;
    if (filters.type === "Individual" && tag === "Group") return false;
    if (filters.type === "Group" && tag !== "Group") return false;
    if (filters.type === "School group" && row[1] !== "SMK Johor Group") return false;
    if (filters.purpose !== "All purposes" && purpose !== filters.purpose) return false;
    return true;
  });

  return (
    <div className="monitorDashboard">
      <section className="panel spanThree">
        <div className="panelHeader">
          <div><h2>Visitor Records</h2><p>Search active and historical visitor records with live tracking status.</p></div>
        </div>
        <SearchBar onSelect={setExpandedVisitor} filters={filters} setFilters={setFilters} />
        {filteredRows.length === 0 ? (
          <div className="smartSuggestion" style={{ marginTop: 12 }}>
            <div>
              <strong>No visitors match these filters</strong>
              <span>Try changing visitor type or purpose above.</span>
            </div>
          </div>
        ) : (
          <VisitorTable rows={filteredRows} expandedVisitor={expandedVisitor} setExpandedVisitor={setExpandedVisitor} />
        )}
      </section>

      <section className="panel">
        <div className="panelHeader"><div><h2>Purpose Summary</h2><p>Active visitors grouped by visit purpose.</p></div></div>
        <RatioBar label="Recreation" value={38} />
        <RatioBar label="Education" value={27} />
        <RatioBar label="Events" value={19} />
        <RatioBar label="Tourism" value={16} />
      </section>

      <section className="panel spanTwo">
        <div className="panelHeader"><div><h2>Selected Visitor Timeline</h2><p>Entry, checkpoints, and tracking flags.</p></div></div>
        <div className="selectedVisitorStrip">
          <strong>{selectedVisitor[1]}</strong>
          <span>{selectedVisitor[0]} · {selectedVisitor[2]} · last seen {selectedVisitor[4]}</span>
        </div>
        <div className="activityTimeline">
          {[
            ["09:18", "Checked in through Main Gate", "Entry"],
            ["09:42", "Reached Palm Garden checkpoint", "Checkpoint"],
            ["10:27", "Entered Lake Trail", "Checkpoint"],
            ["11:36", "Long stay rule warning created", "Alert"]
          ].map(([time, text, type]) => (
            <div className={`activityEvent ${type.toLowerCase()}`} key={`${time}-${text}`}>
              <span>{time}</span><strong>{text}</strong><i>{type}</i>
            </div>
          ))}
        </div>
        <div className="unaccountedBox">
          <AlertTriangle size={18} />
          <div>
            <strong>Pre-closure check preview</strong>
            <span>3 adult visitors currently have no checkout record and will be reviewed 30 minutes before closing.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
