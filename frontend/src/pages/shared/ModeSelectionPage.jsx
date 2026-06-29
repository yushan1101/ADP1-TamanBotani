import React from "react";
import { Smartphone, MonitorCog, ScanFace, Map, MonitorCheck } from "lucide-react";
export function ModeSelectionPage({ onSelectMode }) {
  const modes = [
    { id: "visitor", icon: Smartphone, title: "Visitor App", text: "Phone-size mobile app for registration, QR, map, chatbot and feedback." },
    { id: "staff", icon: MonitorCog, title: "Staff Dashboard", text: "Desktop dashboard for monitoring, analytics, reporting, AI prediction and communication management." },
    { id: "kiosk", icon: ScanFace, title: "Guardhouse Kiosk", text: "Entrance operation console for QR scan, Face ID, checkout control, offline entry and logs." },
    { id: "kioskMonitor", icon: MonitorCheck, title: "Kiosk Monitor", text: "Open the no-phone registration monitor and Face ID enrollment feed directly for entrance staff." }
  ];
  return <main className="modePage"><div className="modeHero"><div className="brandBig"><Map size={38}/></div><p className="eyebrow">Taman Botani Johor</p><h1>Visitor Management System</h1><p>Choose the role-based interface. Visitor App is mobile-sized, Staff Dashboard is desktop-sized, and Guardhouse Kiosk is entrance-operation focused.</p></div><div className="modeGrid">{modes.map(m => <button key={m.id} className="modeTile" onClick={() => onSelectMode(m.id)}><m.icon size={42}/><strong>{m.title}</strong><span>{m.text}</span></button>)}</div></main>;
}
