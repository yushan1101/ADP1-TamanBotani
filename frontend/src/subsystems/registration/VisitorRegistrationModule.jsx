import React, { useState } from "react";
import { CheckCircle2, QrCode, UserRoundPlus, Users } from "lucide-react";
import { registerVisitor } from "../../api/monitoringApi";
import { nextHash, nextId, nowStamp } from "../../data/appState";

const purposeOptions = [
  "Jogging or Recreation",
  "Event or Activity",
  "Education or Research",
  "Homestay",
  "Tree-Planting Course"
];

const activityOptions = ["Walking Trail", "Photography", "Picnic", "Study", "Others"];

export function VisitorRegistrationModule({ appState, setAppState, compact = false }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "Female",
    nationality: "Malaysian",
    race: "Malay",
    purpose: "Jogging or Recreation",
    activity: "Walking Trail",
    visitType: "Individual",
    organisation: "",
    participantCount: "10",
    visitDate: "",
    ageRange: "",
    dominantRace: "Mixed"
  });
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("Complete the form to generate a QR pass.");
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    const age = Number(form.age);
    if (!form.name || !form.phone || !form.age || !agreed) {
      setMessage("Please complete name, phone, age and privacy consent.");
      return;
    }
    if (!Number.isFinite(age) || age < 1 || age > 120) {
      setMessage("Age must be a number between 1 and 120.");
      return;
    }
    if (form.visitType === "Group" && (!form.organisation || !form.visitDate || !form.participantCount || !form.ageRange)) {
      setMessage("Please complete organisation, visit date, total participants and age range for group visit.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await registerVisitor({
        ...form,
        age,
        participantCount: Number(form.participantCount) || 1,
        privacyConsent: agreed
      });
      setAppState((current) => ({
        ...current,
        visitors: [result.visitor, ...current.visitors],
        groups: result.group ? [result.group, ...current.groups] : current.groups,
        passes: [result.pass, ...current.passes],
        logs: [result.log, ...current.logs].slice(0, 20)
      }));
      setMessage(`Registration saved to database. ${result.pass.type} QR ${result.pass.id} generated with security hash ${result.pass.hash}.`);
      return;
    } catch (error) {
      console.warn("Registration API unavailable, using local demo state.", error);
    } finally {
      setSubmitting(false);
    }

    const visitorId = nextId("V");
    const visitor = {
      id: visitorId,
      name: form.name,
      phone: form.phone,
      age,
      gender: form.gender,
      nationality: form.nationality,
      race: form.race,
      purpose: form.purpose,
      activity: form.activity,
      faceId: false,
      status: "active",
      createdAt: nowStamp()
    };

    let pass;
    let group = null;
    if (form.visitType === "Group") {
      const groupId = nextId("G");
      const participantCount = Number(form.participantCount) || 1;
      group = {
        id: groupId,
        leaderName: form.name,
        organisation: form.organisation,
        visitDate: form.visitDate,
        participantCount,
        ageRange: form.ageRange,
        dominantRace: form.dominantRace,
        purpose: form.purpose,
        activity: form.activity,
        status: "active"
      };
      pass = {
        id: `QR-${groupId}`,
        ownerId: groupId,
        ownerName: group.organisation,
        type: "Group",
        hash: nextHash(),
        status: "active",
        savedToPhone: false,
        participantCount,
        ageRange: group.ageRange,
        dominantRace: group.dominantRace
      };
    } else {
      pass = {
        id: `QR-${visitorId}`,
        ownerId: visitorId,
        ownerName: form.name,
        type: "Personal",
        hash: nextHash(),
        status: "active",
        savedToPhone: false,
        participantCount: 1
      };
    }

    setAppState((current) => ({
      ...current,
      visitors: [visitor, ...current.visitors],
      groups: group ? [group, ...current.groups] : current.groups,
      passes: [pass, ...current.passes],
      logs: [`${nowStamp()} - ${pass.type} QR generated for ${pass.ownerName}`, ...current.logs].slice(0, 20)
    }));
    setMessage(`Registration successful. ${pass.type} QR ${pass.id} generated with security hash ${pass.hash}.`);
  };

  return (
    <section className={compact ? "mobileModule" : "panel"}>
      <div className="sectionHead">
        <div>
          <p className="eyebrow">Subsystem 1</p>
          <h2>Visitor Registration Module</h2>
          <p>Individual and group registration with validation, privacy consent, visitor classification and QR generation.</p>
        </div>
        <UserRoundPlus size={30} />
      </div>

      <div className="formGrid">
        <label>Full name<input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Visitor name" /></label>
        <label>Phone number<input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="012-3456789" /></label>
        <label>Age<input value={form.age} onChange={(event) => update("age", event.target.value)} placeholder="1-120" inputMode="numeric" /></label>
        <label>Gender<select value={form.gender} onChange={(event) => update("gender", event.target.value)}><option>Female</option><option>Male</option><option>Prefer not to say</option></select></label>
        <label>Nationality<select value={form.nationality} onChange={(event) => update("nationality", event.target.value)}><option>Malaysian</option><option>Non-Malaysian</option></select></label>
        <label>Race<select value={form.race} onChange={(event) => update("race", event.target.value)}><option>Malay</option><option>Chinese</option><option>Indian</option><option>Others</option></select></label>
        <label>Purpose of visit<select value={form.purpose} onChange={(event) => update("purpose", event.target.value)}>{purposeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Preferred recreational activity<select value={form.activity} onChange={(event) => update("activity", event.target.value)}>{activityOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>

      <div className="visitTypeGroup">
        <span>Visit type</span>
        <label><input type="radio" checked={form.visitType === "Individual"} onChange={() => update("visitType", "Individual")} /> Individual</label>
        <label><input type="radio" checked={form.visitType === "Group"} onChange={() => update("visitType", "Group")} /> Group</label>
      </div>

      {form.visitType === "Group" && (
        <div className="subPanel">
          <h3>Group visit information</h3>
          <div className="formGrid">
            <label>Organisation / institution name<input value={form.organisation} onChange={(event) => update("organisation", event.target.value)} /></label>
            <label>Visit date<input type="date" value={form.visitDate} onChange={(event) => update("visitDate", event.target.value)} /></label>
            <label>Total participants<input value={form.participantCount} onChange={(event) => update("participantCount", event.target.value)} inputMode="numeric" /></label>
            <label>Age range of participants<input value={form.ageRange} onChange={(event) => update("ageRange", event.target.value)} placeholder="e.g. 10-15 years old" /></label>
            <label>Dominant race of group<select value={form.dominantRace} onChange={(event) => update("dominantRace", event.target.value)}><option>Malay</option><option>Chinese</option><option>Indian</option><option>Mixed</option><option>Others</option></select></label>
          </div>
        </div>
      )}

      <label className="checkLine">
        <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /> I agree to the privacy notice.
      </label>
      <button className="primaryButton" onClick={submit} disabled={submitting}>{form.visitType === "Group" ? <Users size={18} /> : <QrCode size={18} />} {submitting ? "Saving..." : "Submit & Generate QR"}</button>
      <div className="notice"><CheckCircle2 size={18} />{message}</div>
    </section>
  );
}
