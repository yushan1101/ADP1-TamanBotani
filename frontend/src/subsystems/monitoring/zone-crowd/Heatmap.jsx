import React, { useState, useRef } from "react";
import { useMonitoring } from "../../../context/MonitoringContext";
import { X, AlertTriangle, Users, Clock, TrendingUp, TrendingDown } from "lucide-react";

const ZONE_DATA = [
  {
    id: "gate", name: "Main Gate", className: "gate",
    baseCapacity: 82, visitors: 164, peakTime: "10:00 – 11:30 AM",
    status: "High", trend: "+12%", trendDir: "up",
    description: "Primary visitor entry point. Currently experiencing above-average footfall with queue build-up at east lane.",
    recommendation: "Deploy one additional officer to east queue lane. Consider opening secondary gate if occupancy exceeds 90%.",
    alertCount: 1,
    focus: { tx: "43%", ty: "40%" },
  },
  {
    id: "lake", name: "Lake Trail", className: "lake",
    baseCapacity: 55, visitors: 110, peakTime: "08:30 – 10:00 AM",
    status: "Moderate", trend: "+4%", trendDir: "up",
    description: "Scenic walkway around the central lake. Visitor flow is steady and within safe parameters.",
    recommendation: "No immediate action required. Monitor trail capacity after 11:00 AM when guided groups typically arrive.",
    alertCount: 0,
    focus: { tx: "-3%", ty: "33%" },
  },
  {
    id: "orchid", name: "Orchid Garden", className: "orchid",
    baseCapacity: 34, visitors: 68, peakTime: "11:00 AM – 12:30 PM",
    status: "Normal", trend: "-3%", trendDir: "down",
    description: "Botanical showcase garden. Currently in normal operating range with comfortable visitor density.",
    recommendation: "Normal operations. Ensure educational signage and lighting are functioning for afternoon visits.",
    alertCount: 0,
    focus: { tx: "22%", ty: "-4%" },
  },
  {
    id: "herb", name: "Herbarium", className: "herb",
    baseCapacity: 62, visitors: 124, peakTime: "09:00 – 11:00 AM",
    status: "Moderate", trend: "+8%", trendDir: "up",
    description: "Indoor herbarium facility. Approaching moderate density — monitor ventilation and indoor flow.",
    recommendation: "Activate indoor crowd flow signage. Ensure ventilation systems are operating at full capacity.",
    alertCount: 1,
    focus: { tx: "-15%", ty: "-23%" },
  },
  {
    id: "cafe", name: "Cafe Court", className: "cafe",
    baseCapacity: 47, visitors: 94, peakTime: "12:00 – 01:30 PM",
    status: "Normal", trend: "+1%", trendDir: "up",
    description: "Visitor rest and dining area. Currently within normal capacity ahead of the lunch peak.",
    recommendation: "Maintain current staffing level. Brief kitchen and service staff on anticipated 12:00 surge.",
    alertCount: 0,
    focus: { tx: "-13%", ty: "17%" },
  },
];

const STATUS_CLASS  = { High: "zoneHigh", Moderate: "zoneModerate", Normal: "zoneNormal" };
const BADGE_CLASS   = { High: "heatBadgeHigh", Moderate: "heatBadgeModerate", Normal: "heatBadgeNormal" };
const TAB_CLASS     = { High: "heatTabHigh", Moderate: "heatTabMod", Normal: "" };

export function Heatmap() {
  const { system } = useMonitoring();
  const hz = system.heatZones;
  const byName = Object.fromEntries(hz.map(z => [z.name, z.fill]));

  const [activeTab, setActiveTab]     = useState("all");
  const [hoverZone, setHoverZone]     = useState(null);
  const [tooltipPos, setTooltipPos]   = useState({ x: 0, y: 0 });
  const [selectedZone, setSelectedZone] = useState(null);

  const zones = ZONE_DATA.map(z => ({ ...z, capacity: byName[z.name] ?? z.baseCapacity }));

  const activeZone = zones.find(z => z.id === activeTab);
  const innerStyle = activeZone
    ? { transform: `scale(1.85) translate(${activeZone.focus.tx}, ${activeZone.focus.ty})` }
    : { transform: "scale(1) translate(0,0)" };

  function handleMouseMove(e, zoneId) {
    setTooltipPos({ x: e.clientX + 18, y: e.clientY - 10 });
    setHoverZone(zoneId);
  }

  function handleZoneClick(zone) {
    setSelectedZone(prev => prev?.id === zone.id ? null : zone);
    setActiveTab(zone.id);
  }

  function clearSelection() {
    setSelectedZone(null);
    setActiveTab("all");
  }

  const hoveredData = zones.find(z => z.id === hoverZone);

  return (
    <section className="panel spanTwo">
      <div className="panelHeader">
        <div>
          <h2>Crowd Heatmap</h2>
          <p>Interactive park zone density overlay. Click a zone tab or zone label to focus and inspect.</p>
        </div>
        <span className="countBadge">Realtime</span>
      </div>

      {/* Zone tabs */}
      <div className="heatmapTabs">
        <button
          className={`heatmapTab ${activeTab === "all" ? "active" : ""}`}
          onClick={clearSelection}
        >
          All Zones
        </button>
        {zones.map(z => (
          <button
            key={z.id}
            className={`heatmapTab ${activeTab === z.id ? "active" : ""} ${TAB_CLASS[z.status] || ""}`}
            onClick={() => handleZoneClick(z)}
          >
            <span className="heatTabLabel">{z.name}</span>
            <span className={`heatTabPct ${STATUS_CLASS[z.status]}`}>{z.capacity}%</span>
          </button>
        ))}
      </div>

      {/* Canvas with zoom viewport */}
      <div className="heatmapCanvas">
        <div
          className="heatmapInner"
          style={{ ...innerStyle, transition: "transform 0.42s cubic-bezier(0.4,0,0.2,1)" }}
        >
          <div className="parkLake" />
          <div className="parkTrail main" />
          <div className="parkTrail branch" />
          <div className="heatBlob hot" />
          <div className="heatBlob warm" />
          <div className="heatBlob cool" />
          <div className="heatBlob mid" />
          {zones.map(z => (
            <div
              key={z.id}
              className={`heatZone ${z.className} ${activeTab === z.id ? "zoneActive" : ""} ${STATUS_CLASS[z.status] || ""}`}
              onMouseMove={(e) => handleMouseMove(e, z.id)}
              onMouseLeave={() => setHoverZone(null)}
              onClick={() => handleZoneClick(z)}
            >
              <strong>{z.name}</strong>
              <span>{z.capacity}%</span>
            </div>
          ))}
        </div>

        {/* Legend stays fixed outside zoom */}
        <div className="heatLegend">
          <span><i className="legendHot" /> High</span>
          <span><i className="legendWarm" /> Moderate</span>
          <span><i className="legendCool" /> Normal</span>
        </div>
      </div>

      {/* Hover tooltip — fixed position to avoid canvas overflow clip */}
      {hoveredData && (
        <div
          className="heatTooltip"
          style={{ position: "fixed", left: tooltipPos.x, top: tooltipPos.y, zIndex: 999 }}
          onMouseEnter={() => setHoverZone(null)}
        >
          <div className="heatTooltipHead">
            <strong>{hoveredData.name}</strong>
            <span className={`heatTooltipStatus ${STATUS_CLASS[hoveredData.status]}`}>{hoveredData.status}</span>
          </div>
          <div className="heatTooltipGrid">
            <div><span>Occupancy</span><strong>{hoveredData.capacity}%</strong></div>
            <div><span>Visitors</span><strong>{hoveredData.visitors}</strong></div>
            <div><span>Alerts</span><strong className={hoveredData.alertCount > 0 ? "ttAlert" : ""}>{hoveredData.alertCount}</strong></div>
          </div>
          <div className="heatTooltipHint">Click to view zone details</div>
        </div>
      )}

      {/* Floating detail panel */}
      {selectedZone && (
        <div className="heatDetailPanel">
          <div className="heatDetailHeader">
            <div className="heatDetailTitle">
              <span className={`heatDetailBadge ${BADGE_CLASS[selectedZone.status]}`}>{selectedZone.status}</span>
              <strong>{selectedZone.name}</strong>
              {selectedZone.trendDir === "up"
                ? <span className="heatDetailTrend up"><TrendingUp size={13}/>{selectedZone.trend}</span>
                : <span className="heatDetailTrend down"><TrendingDown size={13}/>{selectedZone.trend}</span>
              }
            </div>
            <button className="heatDetailClose" onClick={clearSelection}><X size={14}/></button>
          </div>

          <p className="heatDetailDesc">{selectedZone.description}</p>

          <div className="heatDetailGrid">
            <div className="heatDetailStat">
              <Users size={13}/>
              <span>Visitors Now</span>
              <strong>{selectedZone.visitors}</strong>
            </div>
            <div className="heatDetailStat">
              <TrendingUp size={13}/>
              <span>Occupancy</span>
              <strong>{selectedZone.capacity}%</strong>
            </div>
            <div className="heatDetailStat">
              <Clock size={13}/>
              <span>Peak Hours</span>
              <strong>{selectedZone.peakTime}</strong>
            </div>
            <div className="heatDetailStat">
              <AlertTriangle size={13}/>
              <span>Active Alerts</span>
              <strong className={selectedZone.alertCount > 0 ? "statAlert" : ""}>{selectedZone.alertCount}</strong>
            </div>
          </div>

          <div className="heatDetailRec">
            <span>Officer Recommendation</span>
            <p>{selectedZone.recommendation}</p>
          </div>
        </div>
      )}
    </section>
  );
}
