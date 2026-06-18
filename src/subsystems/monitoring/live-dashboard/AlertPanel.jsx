import React, { useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { useToast } from "../../../components/ToastContext";

export function AlertPanel() {
  const [status, setStatus] = useState("open"); // open | dispatched | acknowledged
  const { notify } = useToast();

  if (status === "acknowledged") {
    return (
      <section className="monitorAlertPanel spanThree acknowledged">
        <div className="alertPulseIcon good"><CheckCircle2 size={22} /></div>
        <div>
          <span>Alert acknowledged</span>
          <strong>Main Gate crowd alert has been marked as reviewed.</strong>
          <p>No further action queued. Reopen will appear automatically if density rises again.</p>
        </div>
      </section>
    );
  }

  function handleDispatch() {
    setStatus("dispatched");
    notify("A staff member has been assigned to Main Gate queue lane.", { title: "Staff dispatched", tone: "good" });
  }

  function handleAcknowledge() {
    setStatus("acknowledged");
    notify("Alert marked as reviewed by staff.", { title: "Acknowledged", tone: "info" });
  }

  return (
    <section className="monitorAlertPanel spanThree">
      <div className="alertPulseIcon"><Bell size={22} /></div>
      <div>
        <span>Critical monitoring alert</span>
        <strong>Main Gate crowd density is climbing above the normal 11 AM baseline.</strong>
        <p>
          {status === "dispatched"
            ? "Staff member en route to Main Gate. Daniel Tan long-stay review still pending."
            : "2 active alerts need staff attention: Main Gate queue pressure and Daniel Tan long-stay review."}
        </p>
      </div>
      <div className="alertActionStack">
        <button className="primaryButton" onClick={handleDispatch} disabled={status === "dispatched"}>
          {status === "dispatched" ? "Staff dispatched" : "Dispatch staff"}
        </button>
        <button className="ghostButton" onClick={handleAcknowledge}>Acknowledge</button>
      </div>
    </section>
  );
}
