import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, QrCode, RefreshCw, Wifi, WifiOff } from "lucide-react";
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
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  const [form, setForm] = useState(emptyOfflineForm);
  const [qrReference, setQrReference] = useState("");
  const [message, setMessage] = useState("Ready to store entries locally if the connection drops.");

  const pendingCount = useMemo(
    () => appState.offlineQueue.filter((item) => item.status === "Pending").length,
    [appState.offlineQueue]
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setMessage("Connection restored. Review and sync pending offline entries.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      setMessage("Connection unavailable. Entries are saved locally until sync is possible.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const buildOfflineItem = (type) => {
    const isQr = type === "OfflineQR";
    return {
      id: nextId("OFF"),
      entryType: type,
      reference: isQr ? qrReference.trim() || "Saved QR pass" : "",
      name: isQr ? "Saved QR visitor" : form.name,
      age: isQr ? "" : Number(form.age) || "",
      gender: isQr ? "" : form.gender,
      phone: isQr ? "" : form.phone || "No phone",
      purpose: isQr ? "QR verification pending" : form.purpose,
      activity: isQr ? "" : form.activity,
      status: "Pending",
      createdAt: nowStamp(),
      count: isQr ? 1 : Math.max(Number(form.count) || 1, 1)
    };
  };

  const queueQr = () => {
    const item = buildOfflineItem("OfflineQR");
    setAppState((state) => ({
      ...state,
      offlineQueue: [item, ...state.offlineQueue],
      logs: [`${nowStamp()} - offline QR entry stored locally`, ...state.logs].slice(0, 20)
    }));
    setQrReference("");
    setMessage("QR entry saved locally with sync_status = Pending.");
  };

  const queueForm = () => {
    if (!form.name || !form.age) {
      setMessage("Full name and age are required for offline walk-in entry.");
      return;
    }

    const item = buildOfflineItem("OfflineForm");
    setAppState((state) => ({
      ...state,
      offlineQueue: [item, ...state.offlineQueue],
      logs: [`${nowStamp()} - offline walk-in entry stored locally for ${item.name}`, ...state.logs].slice(0, 20)
    }));
    setForm(emptyOfflineForm);
    setMessage("Walk-in entry saved locally with sync_status = Pending.");
  };

  const sync = () => {
    if (!isOnline) {
      setMessage("Sync is unavailable while the kiosk is offline.");
      return;
    }
    if (!pendingCount) {
      setMessage("No pending offline entries to sync.");
      return;
    }

    setAppState((state) => ({
      ...state,
      offlineQueue: state.offlineQueue.map((item) => item.status === "Pending" ? { ...item, status: "Synced" } : item),
      visits: [
        ...state.offlineQueue
          .filter((item) => item.status === "Pending")
          .map((item) => ({
            id: nextId("VISIT"),
            passId: item.reference || item.id,
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
      logs: [`${nowStamp()} - ${pendingCount} offline entr${pendingCount === 1 ? "y" : "ies"} synchronized`, ...state.logs].slice(0, 20)
    }));
    setMessage("Pending offline entries synced and marked as complete.");
  };

  return (
    <section className="panel">
      <div className="sectionHead">
        <div>
          <p className="eyebrow">Subsystem 1</p>
          <h2>Offline & Fast Entry Module</h2>
          <p>Record visitor entry during connection loss and sync pending records when service returns.</p>
        </div>
        {isOnline ? <Wifi size={30} /> : <WifiOff size={30} />}
      </div>

      <div className={`offlineBanner ${isOnline ? "" : "active"}`}>
        {isOnline ? <Wifi /> : <WifiOff />}
        <strong>{isOnline ? "Online" : "Offline Mode Active"}</strong>
        <span>{message}</span>
      </div>

      <div className="metricRow compact">
        <div className="metricCard">
          <span>Pending Sync</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="metricCard">
          <span>Stored Entries</span>
          <strong>{appState.offlineQueue.length}</strong>
        </div>
        <div className={isOnline ? "metricCard" : "metricCard amber"}>
          <span>Connection</span>
          <strong>{isOnline ? "Online" : "Offline"}</strong>
        </div>
        <div className="metricCard">
          <span>Queue Mode</span>
          <strong>Local</strong>
        </div>
      </div>

      <div className="buttonRow">
        <button className="primaryButton" onClick={sync} disabled={!isOnline || !pendingCount}>
          <RefreshCw size={18} /> Sync Pending Records
        </button>
      </div>

      <div className="split">
        <div className="subPanel">
          <h3>Offline QR Entry</h3>
          <p>Capture the QR/pass reference and verify it after sync.</p>
          <label>QR or pass reference<input value={qrReference} onChange={(event) => setQrReference(event.target.value)} placeholder="Optional if scanner stores payload" /></label>
          <button className="primaryButton offlineFormButton" onClick={queueQr}><QrCode size={18} /> Store QR Entry</button>
        </div>

        <div className="subPanel">
          <h3>Walk-In Entry</h3>
          <div className="formGrid">
            <label>Full name<input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Visitor name" /></label>
            <label>Age<input value={form.age} onChange={(event) => update("age", event.target.value)} inputMode="numeric" /></label>
            <label>Gender<select value={form.gender} onChange={(event) => update("gender", event.target.value)}><option>Female</option><option>Male</option><option>Prefer not to say</option></select></label>
            <label>Phone number<input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Optional" /></label>
            <label>Purpose<select value={form.purpose} onChange={(event) => update("purpose", event.target.value)}><option>Recreation</option><option>Jogging</option><option>Education or Research</option><option>Event or Activity</option><option>Homestay</option><option>Tree-Planting Course</option></select></label>
            <label>Activity<select value={form.activity} onChange={(event) => update("activity", event.target.value)}><option>Walking Trail</option><option>Photography</option><option>Picnic</option><option>Study</option><option>Others</option></select></label>
            <label>Visitor count<input value={form.count} onChange={(event) => update("count", event.target.value)} inputMode="numeric" /></label>
          </div>
          <button className="primaryButton offlineFormButton" onClick={queueForm}><ClipboardList size={18} /> Store Walk-In Entry</button>
        </div>
      </div>

      <table className="dataTable">
        <thead>
          <tr>
            <th>Offline ID</th>
            <th>Type</th>
            <th>Name / Reference</th>
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
              <td>{item.name}{item.reference ? ` / ${item.reference}` : ""}</td>
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
