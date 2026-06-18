import React, { useState } from "react";
import { CalendarDays, Clock, Settings, Save, X } from "lucide-react";
import { StatusItem } from "../../../components/StatusItem";
import { useToast } from "../../../components/ToastContext";

export function SchedulePanel() {
  const [editing, setEditing] = useState(false);
  const [day, setDay] = useState("Monday");
  const [time, setTime] = useState("08:00");
  const [format, setFormat] = useState("PDF");
  const { notify } = useToast();

  function handleSave() {
    setEditing(false);
    notify(`Weekly Operational Analytics will now run every ${day} at ${time} (${format}).`, { title: "Schedule updated", tone: "good" });
  }

  return (
    <section className="panel">
      <div className="panelHeader"><div><h2>Schedule Report</h2><p>Automatic generation settings.</p></div></div>
      <div className="scheduleCard">
        <StatusItem icon={CalendarDays} title="Weekly Operational Analytics" text={`Every ${day}, ${time} ${time < "12:00" ? "AM" : "PM"}, ${format} export.`} tone="good" />
        <StatusItem icon={Clock} title="Next run" text="08/06/2026 08:00 AM" tone="warn" />

        {editing ? (
          <div className="reportBuilder" style={{ marginTop: 4 }}>
            <label>
              Day
              <select value={day} onChange={(e) => setDay(e.target.value)}>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label>
              Time
              <select value={time} onChange={(e) => setTime(e.target.value)}>
                {["06:00", "08:00", "12:00", "18:00", "20:00"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label>
              Format
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option>PDF</option>
                <option>Excel</option>
              </select>
            </label>
            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1", flexWrap: "wrap" }}>
              <button className="primaryButton" style={{ flex: 1, minWidth: 120 }} onClick={handleSave}><Save size={16} /> Save schedule</button>
              <button className="ghostButton" style={{ flex: 1, minWidth: 100 }} onClick={() => setEditing(false)}><X size={16} /> Cancel</button>
            </div>
          </div>
        ) : (
          <button className="ghostButton wideButton" onClick={() => setEditing(true)}><Settings size={16} /> Edit schedule</button>
        )}
      </div>
    </section>
  );
}
