import React from "react";
import { Activity, Database, LogOut, QrCode, ScanFace, WifiOff } from "lucide-react";
const nav = [
  {id:"qr", label:"QR Check-In", icon:QrCode},
  {id:"face", label:"Face ID Check-In", icon:ScanFace},
  {id:"checkout", label:"Checkout Control", icon:Activity},
  {id:"offline", label:"Offline Fast Entry", icon:WifiOff},
  {id:"monitor", label:"Kiosk Monitor", icon:ScanFace},
  {id:"logs", label:"Logs", icon:Database}
];
export function KioskLayout({ page, setPage, title, children, onBack }) { return <main className="kioskShell"><header className="kioskTop"><div><p className="eyebrow">Guardhouse Kiosk / Entrance Station</p><h1>{title}</h1></div><button className="secondaryButton" onClick={onBack}><LogOut size={18}/> Choose Mode</button></header><nav className="kioskTabs">{nav.map(n=><button key={n.id} className={page===n.id?"active":""} onClick={()=>setPage(n.id)}><n.icon size={22}/><strong>{n.label}</strong></button>)}</nav><section className="kioskMain">{children}</section></main>; }
