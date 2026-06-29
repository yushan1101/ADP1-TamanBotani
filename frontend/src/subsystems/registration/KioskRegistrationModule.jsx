import React, { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, ScanFace } from "lucide-react";
import { nextId, nowStamp } from "../../data/appState";

const emptyForm = {
  name: "",
  age: "",
  gender: "Female",
  nationality: "Malaysian",
  race: "Malay",
  phone: "",
  purpose: "Recreation",
  activity: "Walking Trail"
};

export function KioskRegistrationModule({ appState, setAppState }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [step, setStep] = useState("consent");
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("Waiting for visitor consent.");

  useEffect(() => {
    if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
    return () => streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const openCamera = async () => {
    if (!form.name || !form.age) {
      setMessage("Please complete full name and age before face capture.");
      return;
    }
    setStep("capture");
    setMessage("Face camera active. Ask visitor to look directly at the camera.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setMessage("Camera unavailable. Please allow camera access or seek staff assistance.");
    }
  };

  const captureAndRegister = () => {
    const visitorId = nextId("V");
    const visitId = nextId("VISIT");
    const kioskId = nextId("KIOSK");
    const visitor = {
      id: visitorId,
      name: form.name,
      phone: form.phone || "No phone",
      age: Number(form.age) || "",
      gender: form.gender,
      nationality: form.nationality,
      race: form.race,
      purpose: form.purpose,
      activity: form.activity,
      faceId: true,
      status: "active",
      noPhoneVisitor: true,
      createdAt: nowStamp()
    };
    const visit = {
      id: visitId,
      passId: "FACE-ID",
      visitorId,
      name: form.name,
      type: "No-phone visitor",
      channel: "Kiosk Face ID",
      status: "inside",
      count: 1,
      checkInTime: nowStamp(),
      checkOutTime: "",
      checkOutMethod: "",
      notificationTime: "",
      stillInside: false,
      zone: "Main Gate"
    };
    const record = {
      id: kioskId,
      name: form.name,
      status: "Face ID enrolled and entry recorded",
      time: nowStamp()
    };
    setAppState((current) => ({
      ...current,
      visitors: [visitor, ...current.visitors],
      visits: [visit, ...current.visits],
      kioskRecords: [record, ...current.kioskRecords],
      logs: [`${nowStamp()} - No-phone visitor ${form.name} enrolled Face ID at kiosk; no QR generated.`, ...current.logs].slice(0, 20)
    }));
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setStep("success");
    setMessage("Registration successful. Face ID enrolled and entry recorded.");
  };

  return (
    <section className="kioskScreenPanel noPhoneKiosk">
      <div className="kioskTitle">
        <ScanFace size={30} />
        <div><span>Guardhouse Kiosk</span><strong>No-Phone Visitor Registration</strong></div>
      </div>

      {step === "consent" && (
        <div className="kioskStep">
          <h3>Biometric Data Privacy Notice</h3>
          <p>Only a mathematical face representation is stored. It is used solely for Taman Botani Johor check-in verification and expires after 12 months of inactivity.</p>
          <label className="checkLine"><input type="checkbox" defaultChecked /> I agree and continue</label>
          <button className="primaryButton" onClick={() => { setStep("form"); setMessage("Visitor consent captured. Complete the no-phone registration form."); }}>Continue to Form</button>
          <button className="secondaryButton" onClick={() => setMessage("Consent declined. Please refer visitor to staff for manual assistance.")}>Decline</button>
        </div>
      )}

      {step === "form" && (
        <div className="kioskStep">
          <div className="formGrid">
            <label>Full name<input value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
            <label>Age<input value={form.age} onChange={(event) => update("age", event.target.value)} inputMode="numeric" /></label>
            <label>Gender<select value={form.gender} onChange={(event) => update("gender", event.target.value)}><option>Female</option><option>Male</option><option>Prefer not to say</option></select></label>
            <label>Nationality<select value={form.nationality} onChange={(event) => update("nationality", event.target.value)}><option>Malaysian</option><option>Non-Malaysian</option></select></label>
            <label>Race<select value={form.race} onChange={(event) => update("race", event.target.value)}><option>Malay</option><option>Chinese</option><option>Indian</option><option>Others</option></select></label>
            <label>Phone optional<input value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label>
            <label>Purpose<select value={form.purpose} onChange={(event) => update("purpose", event.target.value)}><option>Recreation</option><option>Jogging</option><option>Education or Research</option><option>Event or Activity</option><option>Homestay</option><option>Tree-Planting Course</option></select></label>
            <label>Activity<select value={form.activity} onChange={(event) => update("activity", event.target.value)}><option>Walking Trail</option><option>Photography</option><option>Picnic</option><option>Study</option><option>Others</option></select></label>
          </div>
          <button className="primaryButton wideKioskButton" onClick={openCamera}><Camera size={17} /> Next: Face Capture</button>
        </div>
      )}

      {step === "capture" && (
        <div className="kioskStep">
          <div className="faceCameraCard kioskFaceCapture">
            <div className="faceVideoWrap">
              <video ref={videoRef} className="faceVideo active" autoPlay playsInline muted />
              <div className="faceGuide"><ScanFace size={54} /></div>
            </div>
            <strong>Please look directly at the camera</strong>
            <span>Blink slowly to complete liveness check.</span>
          </div>
          <button className="primaryButton wideKioskButton" onClick={captureAndRegister}><CheckCircle2 size={17} /> Capture & Register</button>
        </div>
      )}

      {step === "success" && (
        <div className="kioskStep">
          <div className="successBox">
            <CheckCircle2 size={62} />
            <strong>Registration successful</strong>
            <span>Your face has been enrolled. On your next visit, the entrance camera can detect your Face ID automatically during check-in.</span>
          </div>
        </div>
      )}

      <div className="kioskStatus">{message}</div>
    </section>
  );
}
