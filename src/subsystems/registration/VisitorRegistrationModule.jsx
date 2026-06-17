import React, { useState } from "react";
import { CheckCircle2, QrCode, UserRoundPlus, Users } from "lucide-react";
import { nextHash, nextId, nowStamp } from "../../data/appState";

export function VisitorRegistrationModule({ appState, setAppState, compact = false }) {
  const [form, setForm] = useState({ name: "", phone: "", age: "", gender: "Female", nationality: "Malaysian", race: "Malay", purpose: "Recreation", activity: "Walking Trail", visitType: "Individual", organisation: "", participantCount: "10", visitDate: "" });
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("Complete the form to generate a QR pass.");
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.name || !form.phone || !form.age || !agreed) return setMessage("Please complete name, phone, age and privacy consent.");
    const visitorId = nextId("V");
    const visitor = { id: visitorId, name: form.name, phone: form.phone, age: Number(form.age), gender: form.gender, nationality: form.nationality, race: form.race, purpose: form.purpose, activity: form.activity, faceId: false, status: "active", createdAt: nowStamp() };
    let pass; let group = null;
    if (form.visitType === "Group") {
      const groupId = nextId("G");
      group = { id: groupId, leaderName: form.name, organisation: form.organisation || "Registered Group", visitDate: form.visitDate || new Date().toISOString().slice(0,10), participantCount: Number(form.participantCount) || 1, purpose: form.purpose, status: "active" };
      pass = { id: `QR-${groupId}`, ownerId: groupId, ownerName: group.organisation, type: "Group", hash: nextHash(), status: "active", savedToPhone: false, participantCount: group.participantCount };
    } else {
      pass = { id: `QR-${visitorId}`, ownerId: visitorId, ownerName: form.name, type: "Personal", hash: nextHash(), status: "active", savedToPhone: false, participantCount: 1 };
    }
    setAppState(s => ({ ...s, visitors: [visitor, ...s.visitors], groups: group ? [group, ...s.groups] : s.groups, passes: [pass, ...s.passes], logs: [`${nowStamp()} - ${pass.type} QR generated for ${pass.ownerName}`, ...s.logs].slice(0, 20) }));
    setMessage(`Registration successful. ${pass.type} QR ${pass.id} generated with security hash ${pass.hash}.`);
  };
  return <section className={compact ? "mobileModule" : "panel"}><div className="sectionHead"><div><p className="eyebrow">Subsystem 1</p><h2>Visitor Registration Module</h2><p>Individual and group registration with validation, privacy consent, visitor classification and QR generation.</p></div><UserRoundPlus size={30}/></div><div className="formGrid"><label>Full name<input value={form.name} onChange={e=>update("name", e.target.value)} placeholder="Visitor name"/></label><label>Phone<input value={form.phone} onChange={e=>update("phone", e.target.value)} placeholder="012-3456789"/></label><label>Age<input value={form.age} onChange={e=>update("age", e.target.value)} placeholder="22"/></label><label>Gender<select value={form.gender} onChange={e=>update("gender", e.target.value)}><option>Female</option><option>Male</option><option>Prefer not to say</option></select></label><label>Nationality<select value={form.nationality} onChange={e=>update("nationality", e.target.value)}><option>Malaysian</option><option>Non-Malaysian</option></select></label><label>Race<select value={form.race} onChange={e=>update("race", e.target.value)}><option>Malay</option><option>Chinese</option><option>Indian</option><option>Others</option></select></label><label>Purpose<select value={form.purpose} onChange={e=>update("purpose", e.target.value)}><option>Recreation</option><option>Jogging</option><option>Education or Research</option><option>Event or Activity</option><option>Homestay</option><option>Tree-Planting Course</option></select></label><label>Visit type<select value={form.visitType} onChange={e=>update("visitType", e.target.value)}><option>Individual</option><option>Group</option></select></label></div>{form.visitType === "Group" && <div className="subPanel"><div className="formGrid"><label>Organisation<input value={form.organisation} onChange={e=>update("organisation", e.target.value)}/></label><label>Visit date<input type="date" value={form.visitDate} onChange={e=>update("visitDate", e.target.value)}/></label><label>Participant count<input value={form.participantCount} onChange={e=>update("participantCount", e.target.value)}/></label><label>Activity<input value={form.activity} onChange={e=>update("activity", e.target.value)}/></label></div></div>}<label className="checkLine"><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/> I agree to the privacy notice.</label><button className="primaryButton" onClick={submit}>{form.visitType === "Group" ? <Users size={18}/> : <QrCode size={18}/>} Submit & Generate QR</button><div className="notice"><CheckCircle2 size={18}/>{message}</div></section>;
}
