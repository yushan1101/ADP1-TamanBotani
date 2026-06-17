import React from "react";
export function ModuleCard({ icon: Icon, title, text, active, onClick }) {
  return <button className={`moduleCard ${active ? "active" : ""}`} onClick={onClick}>{Icon && <Icon size={24}/>}<strong>{title}</strong><span>{text}</span></button>;
}
