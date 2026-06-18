import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronRight, X } from "lucide-react";
import { visitorRows } from "../data/uiData";

export function SearchBar({ onSelect, filters, setFilters }) {
  const [query, setQuery] = useState("");
  const [openFilter, setOpenFilter] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenFilter("");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const matches = query.trim()
    ? visitorRows.filter((row) =>
        row[0].toLowerCase().includes(query.toLowerCase()) ||
        row[1].toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filterDefs = [
    ["type", "Visitor type", ["All types", "Individual", "Group", "School group"]],
    ["date", "Date", ["Today", "Yesterday", "Last 7 days", "Custom range"]],
    ["purpose", "Purpose", ["All purposes", "Recreation", "Education", "Photography"]]
  ];

  return (
    <div className="recordToolbar" ref={containerRef}>
      <div className="smartSearchBox">
        <label>AI record search</label>
        <div className="smartSearchInput">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID or name…"
            style={{ border: "none", outline: "none", background: "transparent", flex: 1, font: "inherit", color: "#10231a", fontWeight: 700 }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              style={{ border: "none", background: "transparent", display: "flex", color: "#7c9388", cursor: "pointer" }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
        {query.trim() && (
          matches.length > 0 ? (
            matches.map((row) => (
              <div className="smartSuggestion" key={row[0]}>
                <div>
                  <strong>{row[1]}</strong>
                  <span>{row[0]} · {row[2]} visit · {row[6] === "Group" ? "Group" : "Individual"} · {row[3]}</span>
                </div>
                <button className="ghostButton" onClick={() => { onSelect(row[0]); setQuery(""); }}>View profile</button>
              </div>
            ))
          ) : (
            <div className="smartSuggestion">
              <div>
                <strong>No matches</strong>
                <span>Try an ID like "V-1028" or a name like "Daniel Tan".</span>
              </div>
            </div>
          )
        )}
      </div>
      <div className="filterDropdownGrid">
        {filterDefs.map(([id, label, options]) => (
          <div className="fakeDropdown" key={id}>
            <button onClick={() => setOpenFilter(openFilter === id ? "" : id)}>
              <span>{label}</span>
              <strong>{filters[id]}</strong>
              <ChevronRight size={15} className={openFilter === id ? "open" : ""} />
            </button>
            {openFilter === id && (
              <div className="dropdownMenu">
                {options.map((option) => (
                  <span
                    key={option}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, [id]: option }));
                      setOpenFilter("");
                    }}
                    style={option === filters[id] ? { background: "#edf9f6", fontWeight: 700 } : undefined}
                  >
                    {option}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
