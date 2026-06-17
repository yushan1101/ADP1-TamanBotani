import React, { useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, Bell, CalendarDays, Camera, CheckCircle2, ChevronRight, ClipboardCheck, Clock, Database, Download, FileText, Gauge, History, Map, QrCode, RefreshCw, Route, ScanFace, Search, Settings, ShieldCheck, Smartphone, UserCheck, Users, WifiOff
} from "lucide-react";
import "./MonitoringModule.css";

const visitorRows = [
  ["V-1028", "Nur Alya", "Recreation", "Inside", "Palm Garden", "11:28", "Normal"],
  ["V-1041", "Daniel Tan", "Jogging", "Inside", "Lake Trail", "11:36", "Long stay"],
  ["G-204", "SMK Johor Group", "Education", "Inside", "Herbarium", "11:44", "Group"],
  ["V-1077", "Priya Nair", "Photography", "Exited", "Exit Gate", "10:58", "Closed"]
];

const zones = [
  { name: "Main Gate", count: 74, level: "High", fill: 82 },
  { name: "Lake Trail", count: 42, level: "Moderate", fill: 55 },
  { name: "Orchid Garden", count: 26, level: "Normal", fill: 34 },
  { name: "Herbarium", count: 51, level: "Moderate", fill: 62 }
];


function StatusItem({ icon: Icon, title, text, tone = "good" }) {
  return (
    <div className={`monitorStatusItem ${tone}`}>
      {Icon && <Icon size={20} />}
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

const forecastBars = [
  ["Fri", 620],
  ["Sat", 1180],
  ["Sun", 1340],
  ["Mon", 520],
  ["Tue", 490],
  ["Holiday", 1580]
];

export function MonitoringModule({ initialTab = "live" }) {
  const [tab, setTab] = useState(initialTab);
  const tabs = [
    { id: "live", label: "Live Dashboard", icon: Gauge },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "zones", label: "Zone Activity", icon: Map },
    { id: "records", label: "Visitor Records", icon: Search },
    { id: "journey", label: "Journey Experience", icon: Route },
    { id: "reports", label: "Operational Reports", icon: FileText }
  ];

  return (
    <div className="monitorWorkspace">
      <section className="monitorCommand">
        <div className="monitorCommandIntro">
          <span className="monitorLivePill"><Activity size={14} /> Live feed healthy</span>
          <h2>Today Operations</h2>
          <p>11:48 AM status board with crowd load, open alerts, staff actions, visitor movement, and report readiness.</p>
          <div className="monitorCommandActions">
            <button className="primaryButton"><RefreshCw size={17} /> Refresh live feed</button>
            <button className="ghostButton"><Download size={17} /> Export snapshot</button>
          </div>
        </div>
        <div className="monitorCommandStats">
          <SummaryTile label="Visitors inside" value="193" note="48% capacity" tone="good" />
          <SummaryTile label="Peak window" value="11:00" note="Main Gate rising" />
          <SummaryTile label="Open alerts" value="2" note="1 crowd, 1 long stay" tone="danger" />
          <SummaryTile label="Reports ready" value="7" note="3 scheduled today" />
        </div>
      </section>

      <div className="monitorTabs" role="tablist" aria-label="Visitor Monitoring modules">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={tab === item.id ? "monitorTab active" : "monitorTab"}
              onClick={() => setTab(item.id)}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "live" && <LiveMonitoringView />}
      {tab === "analytics" && <AnalyticsDemographicsView />}
      {tab === "zones" && <ZoneCrowdView />}
      {tab === "records" && <VisitorRecordsView />}
      {tab === "journey" && <JourneyExperienceView />}
      {tab === "reports" && <OperationalReportsView />}
    </div>
  );
}

function LiveMonitoringView() {
  return (
    <div className="monitorDashboard">
      <section className="monitorAlertPanel spanThree">
        <div className="alertPulseIcon"><Bell size={22} /></div>
        <div>
          <span>Critical monitoring alert</span>
          <strong>Main Gate crowd density is climbing above the normal 11 AM baseline.</strong>
          <p>2 active alerts need staff attention: Main Gate queue pressure and Daniel Tan long-stay review.</p>
        </div>
        <div className="alertActionStack">
          <button className="primaryButton">Dispatch staff</button>
          <button className="ghostButton">Acknowledge</button>
        </div>
      </section>

      <section className="panel monitorHero spanTwo">
        <div className="panelHeader">
          <div>
            <h2>Park Live Status</h2>
            <p>Updated 3 seconds ago from entry gates, exit gates, and zone checkpoints.</p>
          </div>
          <button className="primaryButton"><RefreshCw size={17} /> Refresh Dashboard</button>
        </div>
        <div className="liveStatusGrid">
          <div className="liveDial">
            <strong>193</strong>
            <span>visitors inside</span>
            <i>48% capacity</i>
          </div>
          <div className="statusStack">
            <StatusItem icon={CheckCircle2} title="Occupancy status: Moderate" text="Park capacity threshold remains below alert level." tone="good" />
            <StatusItem icon={Activity} title="Live feed connected" text="Entry, exit and checkpoint movement records are streaming normally." tone="good" />
            <StatusItem icon={AlertTriangle} title="2 high-density highlights" text="Main Gate and Herbarium require staff attention." tone="danger" />
            <div className="staffActionCard">
              <strong>Recommended staff action</strong>
              <span>Send one staff member to Main Gate queue lane and keep Herbarium route open.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div><h2>Current Occupancy</h2><p>Capacity status by area.</p></div>
        </div>
        <div className="compactZoneList">
          {zones.map((zone) => <ZoneMini key={zone.name} zone={zone} />)}
        </div>
      </section>

      <section className="panel spanThree">
        <div className="panelHeader">
          <div><h2>Live Activity Feed</h2><p>Latest check-ins, exits, and zone movements.</p></div>
        </div>
        <div className="activityTimeline">
          {[
            ["11:46", "Group G-204 moved from Orchid Garden to Herbarium", "Movement"],
            ["11:44", "SMK Johor Group checked in through Main Gate", "Check-in"],
            ["11:39", "Crowd density increased at Main Gate", "Density"],
            ["11:36", "Daniel Tan entered Lake Trail checkpoint", "Movement"],
            ["11:31", "Priya Nair checked out at Exit Gate", "Exit"]
          ].map(([time, text, type]) => (
            <div className={`activityEvent ${type.toLowerCase()}`} key={`${time}-${text}`}>
              <span>{time}</span>
              <strong>{text}</strong>
              <i>{type}</i>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AnalyticsDemographicsView() {
  return (
    <div className="monitorDashboard">
      <section className="analyticsHero spanThree">
        <div className="analyticsHeroMain">
          <div className="panelHeader compactHeader">
            <div>
              <span className="sectionKicker">Demographic analytics</span>
              <h2>Visitor demand by time, purpose, and profile</h2>
            </div>
            <div className="filterGrid">
              {["This month", "All types", "All purposes", "Holidays included"].map((item) => (
                <button className="filterChip" key={item}>{item}</button>
              ))}
            </div>
          </div>
          <div className="analyticsFocus">
            <div>
              <span>Total visitors</span>
              <strong>8,742</strong>
              <i>+12.5% vs May</i>
            </div>
            <div className="analyticsSpark" aria-label="Monthly visitor trend chart">
              {[42, 48, 56, 52, 70, 78, 66, 72, 61, 69, 75, 88].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <div className="chartLabels analyticsMonths">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => <span key={m}>{m}</span>)}
          </div>
        </div>

        <aside className="analyticsInsightRail">
          <div className="insightCard primary">
            <span>Decision cue</span>
            <strong>Weekend staffing should be prepared for 486 average visitors.</strong>
          </div>
          <SummaryTile label="Average daily" value="291" note="Weekday baseline" />
          <SummaryTile label="Top nationality" value="Malaysia" note="74% of visitors" />
          <SummaryTile label="Top purpose" value="Recreation" note="38% of visits" />
        </aside>
      </section>

      <section className="panel spanTwo">
        <div className="panelHeader"><div><h2>Visitor Mix</h2><p>Profile split used for facilities and program planning.</p></div></div>
        <div className="segmentGrid">
          {[
            ["Families", 36, "Largest group"],
            ["Tourists", 28, "Photo trail"],
            ["Students", 21, "Learning visit"],
            ["Groups", 15, "Guided route"]
          ].map(([label, value, note]) => (
            <div className="segmentCard" key={label}>
              <div><strong>{value}%</strong><span>{label}</span></div>
              <p>{note}</p>
              <div className="meter"><i style={{ width: `${value}%` }} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader"><div><h2>Peak Signals</h2><p>Time patterns that affect staff allocation.</p></div></div>
        <div className="peakHighlights">
          <StatusItem icon={Clock} title="Peak hour" text="11:00 AM - 12:00 PM" tone="warn" />
          <StatusItem icon={CalendarDays} title="Peak day" text="Saturday has the highest recurring volume." tone="good" />
          <StatusItem icon={Users} title="Returning ratio" text="32% returning visitors this period." tone="good" />
        </div>
      </section>

      <section className="panel spanThree">
        <div className="panelHeader"><div><h2>Category Volume</h2><p>Comparison across visitor groups for operational planning.</p></div></div>
        <div className="categoryRail">
          {[
            ["Local residents", 86],
            ["Domestic tourists", 68],
            ["School groups", 54],
            ["Families", 76],
            ["International tourists", 31]
          ].map(([label, value]) => <RatioBar key={label} label={label} value={value} />)}
        </div>
      </section>
    </div>
  );
}

function ZoneCrowdView() {
  return (
    <div className="monitorDashboard">
      <section className="panel spanTwo">
        <div className="panelHeader">
          <div><h2>Crowd Heatmap</h2><p>Interactive park zone density overlay.</p></div>
          <span className="countBadge">Realtime</span>
        </div>
        <div className="heatmapCanvas">
          <div className="parkLake" />
          <div className="parkTrail main" />
          <div className="parkTrail branch" />
          <div className="heatBlob hot" />
          <div className="heatBlob warm" />
          <div className="heatBlob cool" />
          <div className="heatBlob mid" />
          <div className="heatZone gate"><strong>Main Gate</strong><span>82%</span></div>
          <div className="heatZone lake"><strong>Lake Trail</strong><span>55%</span></div>
          <div className="heatZone orchid"><strong>Orchid Garden</strong><span>34%</span></div>
          <div className="heatZone herb"><strong>Herbarium</strong><span>62%</span></div>
          <div className="heatZone cafe"><strong>Cafe Court</strong><span>47%</span></div>
          <div className="heatLegend">
            <span><i className="legendHot" /> High</span>
            <span><i className="legendWarm" /> Moderate</span>
            <span><i className="legendCool" /> Normal</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader"><div><h2>Zone Occupancy</h2><p>Status and threshold deviation.</p></div></div>
        <div className="compactZoneList">
          {zones.map((zone) => <ZoneMini key={zone.name} zone={zone} />)}
          <StatusItem icon={AlertTriangle} title="Abnormal traffic spike" text="Main Gate is 26% above its usual 11 AM baseline." tone="warn" />
        </div>
      </section>

      <section className="panel spanThree">
        <div className="panelHeader"><div><h2>Visitor Flow Between Zones</h2><p>Movement volume and average transit time.</p></div></div>
        <div className="flowDiagram">
          {[
            ["Main Gate", "Lake Trail", "146 visitors", "6 min"],
            ["Lake Trail", "Orchid Garden", "92 visitors", "9 min"],
            ["Orchid Garden", "Herbarium", "64 visitors", "5 min"],
            ["Herbarium", "Cafe Court", "58 visitors", "7 min"]
          ].map(([from, to, volume, time]) => (
            <div className="flowRoute" key={`${from}-${to}`}>
              <strong>{from}</strong>
              <span />
              <strong>{to}</strong>
              <i>{volume} · avg {time}</i>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function VisitorRecordsView() {
  const [expandedVisitor, setExpandedVisitor] = useState("G-204");
  const [openFilter, setOpenFilter] = useState("type");
  const selectedVisitor = visitorRows.find((row) => row[0] === expandedVisitor) || visitorRows[2];

  return (
    <div className="monitorDashboard">
      <section className="panel spanThree">
        <div className="panelHeader">
          <div><h2>Visitor Records</h2><p>Search active and historical visitor records with live tracking status.</p></div>
        </div>
        <div className="recordToolbar">
          <div className="smartSearchBox">
            <label>AI record search</label>
            <div className="smartSearchInput"><Search size={17} /><span>SMK</span><i>typing...</i></div>
            <div className="smartSuggestion">
              <div>
                <strong>SMK Johor Group</strong>
                <span>G-204 · Education visit · 32 students · Inside</span>
              </div>
              <button className="ghostButton" onClick={() => setExpandedVisitor("G-204")}>View profile</button>
            </div>
          </div>

          <div className="filterDropdownGrid">
            {[
              ["type", "Visitor type", "All types", ["All types", "Individual", "Group", "School group"]],
              ["date", "Date", "Today", ["Today", "Yesterday", "Last 7 days", "Custom range"]],
              ["purpose", "Purpose", "All purposes", ["All purposes", "Recreation", "Education", "Photography"]]
            ].map(([id, label, value, options]) => (
              <div className="fakeDropdown" key={id}>
                <button onClick={() => setOpenFilter(openFilter === id ? "" : id)}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <ChevronRight size={15} className={openFilter === id ? "open" : ""} />
                </button>
                {openFilter === id && (
                  <div className="dropdownMenu">
                    {options.map((option) => <span key={option}>{option}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <table className="dataTable">
          <thead>
            <tr><th></th><th>ID</th><th>Name</th><th>Type</th><th>Purpose</th><th>Status</th><th>Last checkpoint</th><th>Alert</th></tr>
          </thead>
          <tbody>
            {visitorRows.map((row) => (
              <React.Fragment key={row[0]}>
                <tr className={expandedVisitor === row[0] ? "selectedRow" : ""} onClick={() => setExpandedVisitor(row[0])}>
                  <td><ChevronRight size={16} className={expandedVisitor === row[0] ? "open" : ""} /></td>
                  <td><strong>{row[0]}</strong></td>
                  <td>{row[1]}</td>
                  <td>{row[6]}</td>
                  <td>{row[2]}</td>
                  <td className="statusCell">{row[3]}</td>
                  <td>{row[4]}</td>
                  <td><span className={`aiBadge ${row[6] === "Long stay" ? "warn" : row[6] === "Closed" ? "" : "good"}`}><div className="aiBadgeDot" />{row[6]}</span></td>
                </tr>
                {expandedVisitor === row[0] && (
                  <tr className="expandedRecordRow">
                    <td colSpan="8">
                      <VisitorRecordDetails row={row} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
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

function VisitorRecordDetails({ row }) {
  const isGroup = row[0] === "G-204";
  return (
    <div className="recordDetailsPanel">
      <div className="recordProfileCard">
        <span>Profile</span>
        <strong>{row[1]}</strong>
        <p>{row[0]} · {isGroup ? "School group" : "Individual visitor"} · {row[2]}</p>
      </div>
      <div className="recordDetailGrid">
        <div><span>Phone / contact</span><strong>{isGroup ? "Teacher: Cikgu Aminah" : "012-3456789"}</strong></div>
        <div><span>Group size</span><strong>{isGroup ? "32 students" : "1 visitor"}</strong></div>
        <div><span>Current zone</span><strong>{row[4]}</strong></div>
        <div><span>Last seen</span><strong>{row[5]}</strong></div>
        <div><span>Visit status</span><strong>{row[3]}</strong></div>
        <div><span>AI note</span><strong>{isGroup ? "Matches SMK keyword, education purpose, group record." : "No risk pattern detected."}</strong></div>
      </div>
      <div className="recordActionRow">
        <button className="primaryButton"><Route size={16} /> Show journey</button>
        <button className="ghostButton"><Bell size={16} /> Notify staff</button>
        <button className="ghostButton"><FileText size={16} /> Export record</button>
      </div>
    </div>
  );
}

function JourneyExperienceView() {
  return (
    <div className="monitorDashboard">
      <section className="journeyHero spanThree">
        <div className="journeyHeroCopy">
          <span className="sectionKicker">Journey analysis</span>
          <h2>Route quality and visitor experience signals</h2>
          <p>Journey data highlights which routes perform well, where visitors leave early, and which stays need staff review.</p>
          <div className="filterGrid">
            {["Last 30 days", "All visitor categories", "Peak vs off-peak"].map((item) => <button className="filterChip" key={item}>{item}</button>)}
          </div>
        </div>
        <div className="journeyScoreCard">
          <span>Experience score</span>
          <strong>86</strong>
          <i>Stable, with 2 stay-duration reviews</i>
        </div>
      </section>

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

      <section className="panel">
        <div className="panelHeader"><div><h2>Journey KPIs</h2><p>Active experience indicators.</p></div></div>
        <div className="journeyKpis">
          <SummaryTile label="Average dwell time" value="1h 48m" note="Families: 2h 12m" />
          <SummaryTile label="New visitors" value="68%" note="Returning: 32%" />
          <SummaryTile label="Active anomalies" value="2" note="Stay duration review" tone="danger" />
        </div>
      </section>

      <section className="panel spanThree">
        <div className="panelHeader"><div><h2>Top Movement Paths</h2><p>Route sequences ranked by completion rate.</p></div></div>
        <div className="journeyPathGrid">
          {[
            ["Main Gate", "Lake Trail", "Orchid Garden", "Cafe Court", 82],
            ["Main Gate", "Herbarium", "Orchid Garden", "Exit Gate", 64],
            ["Main Gate", "Palm Garden", "Lake Trail", "Exit Gate", 58]
          ].map((path) => (
            <div className="journeyPathCard" key={path.join("-")}>
              <div>
                {path.slice(0, 4).map((stop) => <span key={stop}>{stop}</span>)}
              </div>
              <strong>{path[4]}%</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader"><div><h2>Drop-Off Points</h2><p>Zones where visits end early.</p></div></div>
        <RatioBar label="Cafe Court" value={31} />
        <RatioBar label="Lake Trail end" value={24} />
        <RatioBar label="Herbarium exit" value={18} />
        <StatusItem icon={ShieldCheck} title="Experience weak point" text="Cafe Court shows shortest dwell before exit." tone="warn" />
      </section>

      <section className="panel spanThree">
        <div className="panelHeader"><div><h2>Dwell Time Distribution</h2><p>Grouped by visitor duration segment.</p></div></div>
        <div className="dwellBars">
          {[
            ["< 30m", 18],
            ["30m-1h", 42],
            ["1h-2h", 88],
            ["2h-3h", 61],
            ["3h+", 27],
            ["Anomaly", 9]
          ].map(([label, value]) => (
            <div className="dwellBar" key={label}>
              <span style={{ height: `${value}%` }} />
              <strong>{label}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function OperationalReportsView() {
  const [reportOpen, setReportOpen] = useState("preview");
  const [historyOpen, setHistoryOpen] = useState("Daily Visitor Summary");

  return (
    <div className="monitorDashboard">
      <section className="panel spanTwo">
        <div className="panelHeader">
          <div><h2>Generate Operational Report</h2><p>Select report type, preview analytics, export, or schedule automatic generation.</p></div>
          <div className="buttonRow">
            <button className="ghostButton"><Download size={17} /> Excel</button>
            <button className="primaryButton"><Download size={17} /> PDF</button>
          </div>
        </div>
        <div className="reportBuilder">
          <label>Report type<select value="Operational Analytics" readOnly><option>Operational Analytics</option></select></label>
          <label>Date range<select value="Today" readOnly><option>Today</option></select></label>
          <label>Export format<select value="PDF" readOnly><option>PDF</option></select></label>
        </div>
        <div className="reportPreview">
          <button className="expandHeader" onClick={() => setReportOpen(reportOpen === "preview" ? "" : "preview")}>
            <strong>Daily Visitor Summary Preview</strong>
            <ChevronRight size={17} className={reportOpen === "preview" ? "open" : ""} />
          </button>
          {reportOpen === "preview" && (
            <>
          <div className="analyticsCards">
            <SummaryTile label="Total visitors" value="1,284" note="Today" />
            <SummaryTile label="Peak hour" value="11 AM" note="486 visitors" />
            <SummaryTile label="Top zone" value="Main Gate" note="82% occupancy" />
          </div>
              <div className="reportPreviewDetails">
                <span>Included sections</span>
                <strong>Live count, demographic summary, zone occupancy, alert log, report history</strong>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader"><div><h2>Schedule Report</h2><p>Automatic generation settings.</p></div></div>
        <div className="scheduleCard">
          <StatusItem icon={CalendarDays} title="Weekly Operational Analytics" text="Every Monday, 08:00 AM, PDF export." tone="good" />
          <StatusItem icon={Clock} title="Next run" text="08/06/2026 08:00 AM" tone="warn" />
          <button className="ghostButton wideButton"><Settings size={16} /> Edit schedule</button>
        </div>
      </section>

      <section className="panel spanThree">
        <div className="panelHeader"><div><h2>Generated Report History</h2><p>Past generated files can be downloaded again or removed.</p></div></div>
        <table className="dataTable">
          <thead>
            <tr><th>Report</th><th>Generated</th><th>Format</th><th>Trigger</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {[
              ["Daily Visitor Summary", "02/06/2026 18:00", "PDF", "Scheduled", "Ready"],
              ["Historical Visitor Pattern", "01/06/2026 09:12", "Excel", "Manual", "Ready"],
              ["Operational Analytics", "31/05/2026 18:00", "PDF", "Scheduled", "Ready"]
            ].map((row) => (
              <React.Fragment key={row.join("-")}>
                <tr className={historyOpen === row[0] ? "selectedRow" : ""} onClick={() => setHistoryOpen(historyOpen === row[0] ? "" : row[0])}>
                  {row.map((cell, index) => <td key={cell} className={index === 4 ? "statusCell" : ""}>{cell}</td>)}
                  <td><button className="ghostButton"><Download size={14} /> Download</button></td>
                </tr>
                {historyOpen === row[0] && (
                  <tr className="expandedRecordRow">
                    <td colSpan="6">
                      <div className="reportHistoryDetails">
                        <div><span>File name</span><strong>{row[0].replaceAll(" ", "_")}_2026.pdf</strong></div>
                        <div><span>Generated by</span><strong>{row[3] === "Scheduled" ? "System scheduler" : "Staff admin"}</strong></div>
                        <div><span>Available actions</span><strong>Preview, download again, delete archived copy</strong></div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function SummaryTile({ label, value, note, tone }) {
  return (
    <div className={`summaryTile ${tone || ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <i>{note}</i>
    </div>
  );
}

function RatioBar({ label, value }) {
  return (
    <div className="ratioBar">
      <div><span>{label}</span><strong>{value}%</strong></div>
      <div className="meter"><i style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function ZoneMini({ zone }) {
  return (
    <div className="zoneMini">
      <div>
        <strong>{zone.name}</strong>
        <span>{zone.count} visitors</span>
      </div>
      <div className="meter"><i style={{ width: `${zone.fill}%` }} /></div>
      <small className={zone.level.toLowerCase()}>{zone.level}</small>
    </div>
  );
}

