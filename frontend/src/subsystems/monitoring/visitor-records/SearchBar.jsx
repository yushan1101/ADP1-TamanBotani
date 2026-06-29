import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronRight, X, Calendar, Check } from "lucide-react";

export function SearchBar({ onSelect, filters, setFilters, visitorRows = [] }) {
  const [query,      setQuery]      = useState("");
  const [openFilter, setOpenFilter] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpenFilter("");
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const matches = query.trim()
    ? visitorRows.filter(row =>
        row[0].toLowerCase().includes(query.toLowerCase()) ||
        row[1].toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filterDefs = [
    ["type",    "Visitor type", ["All types", "Individual", "Group", "School group"]],
    ["date",    "Date",         ["Today", "Yesterday", "Last 7 days", "This month", "Custom range"]],
    ["purpose", "Purpose",      ["All purposes", "Recreation", "Education", "Photography", "Tourism"]],
  ];

  const isCustom   = filters.date === "Custom range";
  const hasRange   = isCustom && filters.dateFrom && filters.dateTo;

  // Short label for the chip — "17 Jun → 29 Jun" instead of full ISO
  function fmtDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${parseInt(d)} ${months[parseInt(m)-1]}`;
  }

  function dateLabel() {
    if (hasRange) return `${fmtDate(filters.dateFrom)} – ${fmtDate(filters.dateTo)}`;
    if (isCustom && filters.dateFrom) return `From ${fmtDate(filters.dateFrom)}`;
    if (isCustom) return "Custom range";
    return filters.date;
  }

  return (
    <div className="recordToolbar" ref={containerRef}>
      {/* ── Search box ── */}
      <div className="smartSearchBox">
        <label>Visitor record search</label>
        <div className="smartSearchInput">
          <Search size={17} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by ID or name…"
            style={{ border: "none", outline: "none", background: "transparent", flex: 1, font: "inherit", color: "#10231a", fontWeight: 700 }}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")}
              style={{ border: "none", background: "transparent", display: "flex", color: "#7c9388", cursor: "pointer" }}>
              <X size={15} />
            </button>
          )}
        </div>
        {query.trim() && (
          matches.length > 0 ? matches.map(row => (
            <div className="smartSuggestion" key={row[0]}>
              <div>
                <strong>{row[1]}</strong>
                <span>{row[0]} · {row[2]} · {row[6] === "Group" ? "Group" : "Individual"} · {row[3]}</span>
              </div>
              <button className="ghostButton" onClick={() => { onSelect(row[0]); setQuery(""); }}>View profile</button>
            </div>
          )) : (
            <div className="smartSuggestion">
              <div>
                <strong>No matches</strong>
                <span>Try an ID like "V-1028" or a name.</span>
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Filter chips ── */}
      <div className="filterDropdownGrid">
        {filterDefs.map(([id, label, options]) => (
          <div className="fakeDropdown" key={id}>
            <button onClick={() => setOpenFilter(openFilter === id ? "" : id)}>
              <span>{label}</span>
              <strong style={id === "date" && hasRange ? { fontSize: 12 } : undefined}>
                {id === "date" ? dateLabel() : filters[id]}
              </strong>
              <ChevronRight size={15} className={openFilter === id ? "open" : ""} />
            </button>

            {openFilter === id && (
              <div className="dropdownMenu" style={{ minWidth: id === "date" ? 240 : undefined, padding: 0, overflow: "hidden" }}>

                {/* ── Preset options ── */}
                <div style={{ padding: "6px 0" }}>
                  {options.map(option => (
                    <span
                      key={option}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          [id]: option,
                          ...(id === "date" && option !== "Custom range" ? { dateFrom: "", dateTo: "" } : {})
                        }));
                        if (!(id === "date" && option === "Custom range")) setOpenFilter("");
                      }}
                      style={{
                        display: "block",
                        padding: "8px 14px",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: option === filters[id] ? 700 : 400,
                        background: option === filters[id] ? "#edf9f0" : "transparent",
                        color: option === filters[id] ? "#2d6a3f" : "#222",
                        borderLeft: option === filters[id] ? "3px solid #6b8f47" : "3px solid transparent",
                      }}
                    >
                      {option}
                    </span>
                  ))}
                </div>

                {/* ── Custom date picker panel ── */}
                {id === "date" && filters.date === "Custom range" && (
                  <div style={{
                    borderTop: "2px solid #e8f0e2",
                    background: "#f4f9f0",
                    padding: "14px 14px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Calendar size={14} style={{ color: "#6b8f47" }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#4a6b2a", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                        Select date range
                      </span>
                    </div>

                    {/* From */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#6b8f47" }}>FROM</span>
                      <input
                        type="date"
                        value={filters.dateFrom || ""}
                        max={filters.dateTo || undefined}
                        onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                        style={dateInputStyle}
                      />
                    </div>

                    {/* To */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#6b8f47" }}>TO</span>
                      <input
                        type="date"
                        value={filters.dateTo || ""}
                        min={filters.dateFrom || undefined}
                        onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        style={dateInputStyle}
                      />
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                      <button
                        onClick={() => setOpenFilter("")}
                        disabled={!filters.dateFrom || !filters.dateTo}
                        style={{
                          flex: 1,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          padding: "9px 0",
                          borderRadius: 8,
                          border: "none",
                          background: (!filters.dateFrom || !filters.dateTo) ? "#c8dbb8" : "#3a7d44",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: (!filters.dateFrom || !filters.dateTo) ? "not-allowed" : "pointer",
                        }}
                      >
                        <Check size={14} /> Apply
                      </button>
                      <button
                        onClick={() => {
                          setFilters(prev => ({ ...prev, date: "Today", dateFrom: "", dateTo: "" }));
                          setOpenFilter("");
                        }}
                        style={{
                          flex: 1,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          padding: "9px 0",
                          borderRadius: 8,
                          border: "1.5px solid #d94f4f",
                          background: "#fff5f5",
                          color: "#d94f4f",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        <X size={14} /> Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const dateInputStyle = {
  border: "1.5px solid #c8dbb8",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13,
  color: "#2d4a1e",
  background: "#fff",
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
  cursor: "pointer",
};