import React, { useState } from "react";
import { Route, Bell, FileText, CheckCircle2 } from "lucide-react";
import { useToast } from "../../../components/ToastContext";
import { downloadTextFile } from "../utils/download";

export function VisitorDetail({ row }) {
  const isGroup = row[0] === "G-204";
  const [showJourney, setShowJourney] = useState(false);
  const [notified, setNotified] = useState(false);
  const { notify } = useToast();

  function handleNotifyStaff() {
    setNotified(true);
    notify(`Staff have been alerted to check on ${row[1]} (${row[0]}) at ${row[4]}.`, { title: "Notify staff", tone: "good" });
    setTimeout(() => setNotified(false), 2500);
  }

  function handleExportRecord() {
    const lines = [
      `Visitor record export`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `ID: ${row[0]}`,
      `Name: ${row[1]}`,
      `Type: ${isGroup ? "School group" : "Individual visitor"}`,
      `Purpose: ${row[2]}`,
      `Status: ${row[3]}`,
      `Current zone: ${row[4]}`,
      `Last seen: ${row[5]}`,
      `Contact: ${isGroup ? "Teacher: Cikgu Aminah" : "012-3456789"}`,
      `Group size: ${isGroup ? "32 students" : "1 visitor"}`,
      `System flag: ${isGroup ? "Matches SMK keyword, education purpose, group record." : "No risk pattern detected."}`
    ];
    downloadTextFile(`visitor-record-${row[0]}.txt`, lines.join("\n"));
    notify(`Record for ${row[1]} downloaded to your device.`, { title: "Export record", tone: "good" });
  }

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
        <div><span>System flag</span><strong>{isGroup ? "Matches SMK keyword, education purpose, group record." : "No risk pattern detected."}</strong></div>
      </div>
      <div className="recordActionRow">
        <button className="primaryButton" onClick={() => setShowJourney((v) => !v)}>
          <Route size={16} /> {showJourney ? "Hide journey" : "Show journey"}
        </button>
        <button className="ghostButton" onClick={handleNotifyStaff} disabled={notified}>
          {notified ? <CheckCircle2 size={16} /> : <Bell size={16} />} {notified ? "Staff notified" : "Notify staff"}
        </button>
        <button className="ghostButton" onClick={handleExportRecord}><FileText size={16} /> Export record</button>
      </div>
      {showJourney && (
        <div className="activityTimeline" style={{ marginTop: 12 }}>
          {[
            ["Main Gate", "Entry checkpoint"],
            [row[4], "Currently tracked here"],
            ["Next: " + (row[4] === "Herbarium" ? "Orchid Garden" : "Cafe Court"), "Predicted next stop"]
          ].map(([place, note]) => (
            <div className="activityEvent movement" key={place}>
              <span>{row[5]}</span>
              <strong>{place}</strong>
              <i>{note}</i>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
