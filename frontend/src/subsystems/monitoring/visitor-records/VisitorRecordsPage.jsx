// src/subsystems/monitoring/visitor-records/VisitorRecordsPage.jsx
// Updated: fetches real visitor data from backend API instead of static uiData.js
import React, { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { SearchBar }    from "./SearchBar";
import { VisitorTable } from "./VisitorTable";
import { RatioBar }     from "../../../components/RatioBar";
import { fetchVisitors, fetchVisitorById } from "../../../api/monitoringApi";

export function VisitorRecordsPage() {
  const [expandedVisitor, setExpandedVisitor] = useState(null);
  const [filters, setFilters]   = useState({ type: "All types", date: "Today", purpose: "All purposes", dateFrom: "", dateTo: "" });
  const [visitorRows, setRows]  = useState([]);
  const [purposeSummary, setPurpose] = useState([]);
  const [visitorDetail, setDetail]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch records whenever filters change
  // For custom range, only fetch once both dates are selected
  useEffect(() => {
    if (filters.date === "Custom range" && (!filters.dateFrom || !filters.dateTo)) return;
    setLoading(true);
    fetchVisitors(filters)
      .then(data => {
        setRows(data.visitorRows || []);
        setPurpose(data.purposeSummary || []);
        // Auto-select first row
        if (data.visitorRows?.length > 0 && !expandedVisitor) {
          setExpandedVisitor(data.visitorRows[0][0]);
        }
      })
      .catch(err => console.error("fetchVisitors:", err))
      .finally(() => setLoading(false));
  }, [filters]);

  // Fetch visitor detail when a row is selected
  useEffect(() => {
    if (!expandedVisitor) return;
    setDetailLoading(true);
    fetchVisitorById(expandedVisitor)
      .then(data => setDetail(data))
      .catch(err => console.error("fetchVisitorById:", err))
      .finally(() => setDetailLoading(false));
  }, [expandedVisitor]);

  // The row tuple selected in the table
  const selectedRow = visitorRows.find(r => r[0] === expandedVisitor);

  // Client-side filter (same logic as before, applied on top of server filters)
  const filteredRows = visitorRows.filter(row => {
    const [, , purpose, , , , tag] = row;
    if (filters.type === "Individual" && tag === "Group")     return false;
    if (filters.type === "Group"      && tag !== "Group")     return false;
    if (filters.purpose !== "All purposes" && purpose !== filters.purpose) return false;
    return true;
  });

  return (
    <div className="monitorDashboard">
      {/* ── Main records panel ──────────────────────────────── */}
      <section className="panel spanThree">
        <div className="panelHeader">
          <div>
            <h2>Visitor Records</h2>
            <p>Search active and historical visitor records with live tracking status.</p>
          </div>
        </div>

        <SearchBar onSelect={setExpandedVisitor} filters={filters} setFilters={setFilters} visitorRows={visitorRows} />

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "20px 0", color: "var(--text-muted)" }}>
            <Loader2 size={18} className="spin" /> Loading visitor records…
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="smartSuggestion" style={{ marginTop: 12 }}>
            <div>
              <strong>No visitors match these filters</strong>
              <span>Try changing visitor type, date, or purpose above.</span>
            </div>
          </div>
        ) : (
          <VisitorTable
            rows={filteredRows}
            expandedVisitor={expandedVisitor}
            setExpandedVisitor={setExpandedVisitor}
          />
        )}
      </section>

      {/* ── Purpose summary ─────────────────────────────────── */}
      <section className="panel">
        <div className="panelHeader">
          <div><h2>Purpose Summary</h2><p>Visitors grouped by visit purpose.</p></div>
        </div>
        {purposeSummary.length > 0
          ? purposeSummary.map(p => (
              <RatioBar key={p.label} label={p.label} value={p.value} />
            ))
          : <>
              <RatioBar label="Recreation" value={38} />
              <RatioBar label="Education"  value={27} />
              <RatioBar label="Events"     value={19} />
              <RatioBar label="Tourism"    value={16} />
            </>
        }
      </section>

      {/* ── Selected visitor timeline ────────────────────────── */}
      <section className="panel spanTwo">
        <div className="panelHeader">
          <div><h2>Selected Visitor Timeline</h2><p>Entry, checkpoints, and tracking flags.</p></div>
        </div>

        {selectedRow && (
          <div className="selectedVisitorStrip">
            <strong>{selectedRow[1]}</strong>
            <span>{selectedRow[0]} · {selectedRow[2]} · last seen {selectedRow[4]}</span>
          </div>
        )}

        {detailLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0", color: "var(--text-muted)" }}>
            <Loader2 size={16} className="spin" /> Loading timeline…
          </div>
        ) : visitorDetail?.visits?.length > 0 ? (
          <div className="activityTimeline">
            {visitorDetail.visits.slice(0, 6).map((v, i) => {
              const t    = new Date(v.check_in_time);
              const time = t.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", hour12: false });
              const type = v.status === "inside" ? "Entry" : "Exit";
              return (
                <div className={`activityEvent ${type.toLowerCase()}`} key={v.id || i}>
                  <span>{time}</span>
                  <strong>
                    {v.status === "inside"
                      ? `Checked in at ${v.zone || "Main Gate"} via ${v.entry_method}`
                      : `Checked out from ${v.zone || "Exit Gate"}`}
                  </strong>
                  <i>{type}</i>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="activityTimeline">
            {[
              ["—", "No visit history found for this visitor", "Entry"]
            ].map(([time, text, type]) => (
              <div className={`activityEvent ${type.toLowerCase()}`} key={text}>
                <span>{time}</span><strong>{text}</strong><i>{type}</i>
              </div>
            ))}
          </div>
        )}

        <div className="unaccountedBox">
          <AlertTriangle size={18} />
          <div>
            <strong>Pre-closure check preview</strong>
            <span>
              {visitorRows.filter(r => r[3] === "Inside").length} visitor(s) currently inside
              with no checkout — will be reviewed 30 minutes before closing.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}