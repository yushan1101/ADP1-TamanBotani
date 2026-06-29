import React, { useState } from "react";
import { Bell, CheckCircle2, Clock3, MapPin, ShieldAlert, UserRoundSearch } from "lucide-react";
import { useToast } from "../../../components/ToastContext";

export function AlertPanel() {
  const [status, setStatus] = useState("open"); // open | dispatched | acknowledged
  const { notify } = useToast();

  if (status === "acknowledged") {
    return (
      <section id="operational-alerts" className="panel alertQueuePanel spanThree acknowledged">
        <div className="panelHeader alertQueueHeader">
          <div>
            <span className="queueStatePill cleared"><CheckCircle2 size={14} /> Alert queue reviewed</span>
            <h2>Operational Alerts</h2>
            <p>Main Gate crowd alert has been marked as reviewed.</p>
          </div>
        </div>
        <div className="alertEmptyState">No active dispatch action queued. The queue will reopen automatically if density rises again.</div>
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
    <section id="operational-alerts" className="panel alertQueuePanel spanThree">
      <div className="panelHeader alertQueueHeader">
        <div>
          <span className="queueStatePill danger"><Bell size={14} /> {status === "dispatched" ? "Dispatch in progress" : "2 active alerts"}</span>
          <h2>Operational Alerts</h2>
          <p>{status === "dispatched" ? "One officer is moving to Main Gate. Keep reviewing unresolved visitor risk." : "Incidents that need staff acknowledgement or assignment."}</p>
        </div>
        <button className="ghostButton" onClick={handleAcknowledge}>Acknowledge queue</button>
      </div>

      <div className="alertIncidentGrid">
        <article className="alertIncidentCard critical">
          <div className="incidentIcon"><ShieldAlert size={18} /></div>
          <div className="incidentBody">
            <div className="incidentMeta">
              <span>Critical</span>
              <i><MapPin size={13} /> Main Gate</i>
            </div>
            <strong>Crowd density is climbing above the normal 11 AM baseline.</strong>
            <p>Queue pressure may block entry flow. Assign one officer to the queue lane and redirect groups toward Herbarium.</p>
          </div>
          <div className="incidentActions">
            <button className="primaryButton" onClick={handleDispatch} disabled={status === "dispatched"}>
              {status === "dispatched" ? "Staff dispatched" : "Dispatch staff"}
            </button>
            <small>{status === "dispatched" ? "Officer en route" : "Action required"}</small>
          </div>
        </article>

        <article className="alertIncidentCard warning">
          <div className="incidentIcon"><UserRoundSearch size={18} /></div>
          <div className="incidentBody">
            <div className="incidentMeta">
              <span>Review</span>
              <i><Clock3 size={13} /> Long stay</i>
            </div>
            <strong>Daniel Tan requires a long-stay review at Lake Trail.</strong>
            <p>Last checkpoint record remains inside the trail area. Ask nearby staff to confirm visitor status during patrol.</p>
          </div>
          <div className="incidentActions muted">
            <button className="ghostButton" onClick={handleAcknowledge}>Mark reviewed</button>
            <small>Pending check</small>
          </div>
        </article>
      </div>
    </section>
  );
}
