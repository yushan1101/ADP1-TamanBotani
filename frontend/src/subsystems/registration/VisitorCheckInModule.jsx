import React, { useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, QrCode, ScanFace } from "lucide-react";
import { nextId, nowStamp } from "../../data/appState";

export function VisitorCheckInModule({ appState, setAppState, mode = "qr" }) {
  const [selectedPass, setSelectedPass] = useState(appState.passes[0]?.id || "");
  const [selectedVisitor, setSelectedVisitor] = useState(appState.visitors.find(v=>v.faceId)?.id || "");
  const [message, setMessage] = useState("Scanner ready. Verify QR or process Face ID capture.");
  const checkIn = (pass, channel) => {
    if (!pass) return setMessage("Invalid or unrecognised QR / Face ID profile.");
    if (appState.visits.some(v => v.passId === pass.id && v.status === "inside")) return setMessage("Duplicate check-in detected. Visitor is already inside.");
    const visit = { id: nextId("VISIT"), passId: pass.id, visitorId: pass.ownerId, name: pass.ownerName, type: pass.type, channel, status: "inside", count: pass.participantCount || 1, checkInTime: nowStamp(), checkOutTime: "", checkOutMethod: "", notificationTime: "", stillInside: false, zone: "Main Gate" };
    setAppState(s => ({ ...s, visits: [visit, ...s.visits], logs: [`${nowStamp()} - ${channel} check-in recorded for ${pass.ownerName}`, ...s.logs].slice(0, 20) }));
    setMessage(`${channel} check-in recorded. Welcome to Taman Botani Johor! Head count added: ${visit.count}.`);
  };
  const processQr = () => checkIn(appState.passes.find(p => p.id === selectedPass), "QR");
  const processFace = () => {
    const visitor = appState.visitors.find(v => v.id === selectedVisitor);
    const pass = appState.passes.find(p => p.ownerId === visitor?.id) || { id: "FACE-ID", ownerId: visitor?.id, ownerName: visitor?.name, type: "Personal", participantCount: 1 };
    checkIn(pass, "FaceID");
  };
  return <section className="panel"><div className="sectionHead"><div><p className="eyebrow">Subsystem 1</p><h2>{mode === "face" ? "Face ID Check-In Module" : "QR Check-In Module"}</h2><p>Entrance check-in with QR hash validation, duplicate detection, Face ID matching and live count updates.</p></div>{mode === "face" ? <ScanFace size={30}/> : <QrCode size={30}/>}</div>{mode === "face" ? <div className="split"><div><label>Detected Face ID Profile<select value={selectedVisitor} onChange={e=>setSelectedVisitor(e.target.value)}>{appState.visitors.filter(v=>v.faceId).map(v => <option key={v.id} value={v.id}>{v.name} - {v.id}</option>)}</select></label><div className="scannerMock"><ScanFace size={82}/><strong>Entrance camera capture</strong><span>Liveness passed | Confidence 96%</span></div><button className="primaryButton" onClick={processFace}><Camera size={18}/> Process Face ID Capture</button></div><div className="notice large"><CheckCircle2/>Automatic check-in updates visit_records, last_used_timestamp and sends a welcome push notification.</div></div> : <div className="split"><div><label>QR pass<select value={selectedPass} onChange={e=>setSelectedPass(e.target.value)}>{appState.passes.map(p => <option key={p.id} value={p.id}>{p.id} - {p.ownerName}</option>)}</select></label><button className="primaryButton" onClick={processQr}><QrCode size={18}/> Verify & Check In</button><button className="secondaryButton" onClick={()=>setMessage("Invalid QR rejected and security event recorded.")}><AlertTriangle size={18}/> Simulate Invalid QR</button></div><div className="scannerDisplay"><QrCode size={80}/><strong>Entrance Scanner Display</strong><span>{message}</span></div></div>}<div className="notice">{message}</div></section>;
}
