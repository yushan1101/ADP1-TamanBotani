import React, { useState } from "react";
import { ClipboardList, RefreshCw, WifiOff } from "lucide-react";
import { nextId, nowStamp } from "../../data/appState";

const emptyOfflineForm = {
  name: "",
  age: "",
  gender: "Female",
  phone: "",
  purpose: "Recreation",
  activity: "Walking Trail",
  count: "1"
};

export function OfflineFastEntryModule({ appState, setAppState }) {
  const [fails, setFails] = useState(0);
  const [offline, setOffline] = useState(false);
  const [form, setForm] = useState(emptyOfflineForm);
  const [message, setMessage] = useState("Heartbeat checks run every 30 seconds.");

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const fail = () => {
    const next = fails + 1;
    setFails(next);
    if (next >= 3) {
      setOffline(true);
      setMessage("Offline Mode - simplified check-in is active. Your entry will be uploaded when connection is restored.");
    } else {
      setMessage(`Heartbeat failed ${next}/3.`);
    }
  };

  const buildOfflineItem = (type) => {
    const isQr = type === "OfflineQR";
    return {
      id: nextId("OFF"),
      entryType: type,
      name: form.name || (isQr ? "Saved QR visitor" : "Offline visitor"),
      age: Number(form.age) || "",
      gender: form.gender,
      phone: form.phone || "No phone",
      purpose: form.purpose,
      activity: form.activity,
      status: "Pending",
      createdAt: nowStamp(),
      count: Math.max(Number(form.count) || 1, 1)
    };
  };

  const queue = (type) => {
    if (type === "OfflineForm" && (!form.name || !form.age)) {
      setMessage("Full name and age are required for offline form check-in.");
      return;
    }

    const item = buildOfflineItem(type);
    setAppState((state) => ({
      ...state,
      offlineQueue: [item, ...state.offlineQueue],
      logs: [`${nowStamp()} - ${type} stored in encrypted local queue for ${item.name}`, ...state.logs].slice(0, 20)
    }));
    setForm(emptyOfflineForm);
    setMessage(`${type} recorded offline with sync_status = Pending.`);
  };

  const sync = () => {
    setAppState((state) => ({
      ...state,
      offlineQueue: state.offlineQueue.map((item) => item.status === "Pending" ? { ...item, status: "Synced" } : item),
      visits: [
        ...state.offlineQueue
          .filter((item) => item.status === "Pending")
          .map((item) => ({
            id: nextId("VISIT"),
            passId: item.id,
            visitorId: item.id,
            name: item.name,
            type: "Offline",
            channel: item.entryType,
            status: "inside",
            count: item.count,
            checkInTime: item.createdAt,
            checkOutTime: "",
            checkOutMethod: "",
            zone: "Main Gate",
            age: item.age,
            gender: item.gender,
            phone: item.phone,
            purpose: item.purpose,
            activity: item.activity
          })),
        ...state.visits
      ],
      logs: [`${nowStamp()} - offline queue synchronized`, ...state.logs].slice(0, 20)
    }));
    setOffline(false);
    setFails(0);
    setMessage("Connection restored. Pending records uploaded and staff dashboard updated.");
  };

  return (
    <section className="panel">
      <div className="sectionHead">
        <div>
          <p className="eyebrow">Subsystem 1</p>
          <h2>Offline & Fast Entry Module</h2>
          <p>Heartbeat monitoring, offline QR scan, simplified offline form, local encrypted queue and sync recovery.</p>
        </div>
        <WifiOff size={30} />
      </div>

      <div className={`offlineBanner ${offline ? "active" : ""}`}>
        <WifiOff />
        <strong>{offline ? "Offline Mode Active" : "Online Mode"}</strong>
        <span>{message}</span>
      </div>

      <div className="buttonRow">
        <button className="secondaryButton" onClick={fail}>Record Failed Heartbeat</button>
        <button className="secondaryButton" onClick={() => { setOffline(true); setFails(3); }}>Activate Offline Mode</button>
        <button className="primaryButton" onClick={sync}><RefreshCw size={18} /> Restore Connection & Sync</button>
      </div>

      <div className="split">
        <div className="subPanel">
          <h3>Offline QR</h3>
          <p>Store QR payload locally until backend verification returns.</p>
          <button className="primaryButton" onClick={() => queue("OfflineQR")}>Scan Saved QR Offline</button>
        </div>

        <div className="subPanel">
          <h3>Simplified Form</h3>
          <div className="formGrid">
            <label>Full name<input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Offline visitor name" /></label>
            <label>Age<input value={form.age} onChange={(event) => update("age", event.target.value)} inputMode="numeric" /></label>
            <label>Gender<select value={form.gender} onChange={(event) => update("gender", event.target.value)}><option>Female</option><option>Male</option><option>Prefer not to say</option></select></label>
            <label>Phone number<input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Optional" /></label>
            <label>Purpose<select value={form.purpose} onChange={(event) => update("purpose", event.target.value)}><option>Recreation</option><option>Jogging</option><option>Education or Research</option><option>Event or Activity</option><option>Homestay</option><option>Tree-Planting Course</option></select></label>
            <label>Activity<select value={form.activity} onChange={(event) => update("activity", event.target.value)}><option>Walking Trail</option><option>Photography</option><option>Picnic</option><option>Study</option><option>Others</option></select></label>
            <label>Visitor count<input value={form.count} onChange={(event) => update("count", event.target.value)} inputMode="numeric" /></label>
          </div>
          <button className="primaryButton offlineFormButton" onClick={() => queue("OfflineForm")}><ClipboardList size={18} /> Check In Offline</button>
        </div>
      </div>

      <table className="dataTable">
        <thead>
          <tr>
            <th>Offline ID</th>
            <th>Type</th>
            <th>Name</th>
            <th>Details</th>
            <th>Status</th>
            <th>Captured</th>
          </tr>
        </thead>
        <tbody>
          {appState.offlineQueue.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.entryType}</td>
              <td>{item.name}</td>
              <td>{item.age || "-"} | {item.gender || "-"} | {item.phone || "-"} | {item.purpose || "-"} | {item.activity || "-"}</td>
              <td>{item.status}</td>
              <td>{item.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
