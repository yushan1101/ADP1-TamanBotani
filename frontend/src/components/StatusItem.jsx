import React from "react";
export function StatusItem({ icon: Icon, title, text, tone }) {
  return (
    <div className={`statusItem ${tone || ""}`}>
      <Icon size={19} />
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}
