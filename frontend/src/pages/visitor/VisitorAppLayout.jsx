import React from "react";
import { Home, Map, MessageCircle, QrCode, Star } from "lucide-react";
export function VisitorAppLayout({ page, setPage, title, children, onBack }) {
  const nav = [{id:"home",label:"Home",icon:Home},{id:"qr",label:"QR",icon:QrCode},{id:"map",label:"Map",icon:Map},{id:"chat",label:"Chat",icon:MessageCircle},{id:"feedback",label:"Feedback",icon:Star}];
  return <main className="visitorShell"><button className="backLink" onClick={onBack}>← Choose mode</button><div className="phoneFrame"><div className="phoneBar"/><header className="visitorHeader"><span>Taman Botani Johor</span><strong>{title}</strong></header><section className="visitorScreen">{children}</section><nav className="bottomNav">{nav.map(n=><button key={n.id} className={page===n.id?"active":""} onClick={()=>setPage(n.id)}><n.icon size={18}/><span>{n.label}</span></button>)}</nav></div></main>;
}
